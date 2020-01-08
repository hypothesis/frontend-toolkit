"use strict";

const fs = require("fs");
const path = require("path");

const babelTraverse = require("@babel/traverse").default;
const glob = require("glob");
const recast = require("recast");
const resolve = require("resolve");
const types = require("@babel/types");

function parse(code) {
  return recast.parse(code, {
    parser: require("recast/parsers/babel")
  });
}

/**
 * Print a transformed AST using Recast, preserving the original source of any
 * unmodified nodes.
 */
function printAST(ast) {
  const output = recast.print(ast, {
    quote: "single"
  });
  return output.code;
}

/**
 * Find all the CommonJS/Node `module.exports` assignments in a source file and invoke
 * `callback` with the Babel AST path.
 *
 * @param {string} code - Source code of module
 * @param {Function} callback - Callback invoked with Babel AST path object
 */
function processCommonJSExports(code, callback) {
  const ast = parse(code);

  babelTraverse(ast, {
    AssignmentExpression(path) {
      const target = path.node.left;

      // module.exports = ...
      const isModuleExportsAssignment =
        target.type === "MemberExpression" &&
        target.object.name === "module" &&
        target.property.name === "exports";

      // exports = ...
      const isExportsAssignment =
        target.type === "Identifier" && target.name === "exports";

      if (!isModuleExportsAssignment && !isExportsAssignment) {
        return;
      }

      callback(path);
    }
  });

  return ast;
}

/**
 * Analyze the exports of a CommonJS module and return `true` if the module
 * should be considered to have a "default" export.
 */
function detectDefaultExport(code) {
  let hasDefaultExport = false;

  processCommonJSExports(code, path => {
    hasDefaultExport =
      types.isObjectExpression(path.node.right) &&
      areValuesAllIdentifiers(path.node.right);
  });

  return hasDefaultExport;
}

/**
 * Find all the CommonJS/Node `require` calls in a source file and invoke
 * `callback` with `(path, dependencyPath, absoluteDependencyPath)` where
 * `path` is a Babel AST path.
 */
function processCommonJSImports(code, modulePath, callback) {
  const ast = parse(code);
  babelTraverse(ast, {
    CallExpression(path) {
      // Check that this is a `require` call with a single string literal arg.
      const isRequireCall =
        types.isIdentifier(path.node.callee) &&
        path.node.callee.name === "require";

      if (!isRequireCall) {
        return;
      }

      if (
        path.node.arguments.length !== 1 ||
        !types.isStringLiteral(path.node.arguments[0])
      ) {
        return;
      }

      const dependencyPath = path.node.arguments[0].value;
      const absPath = absoluteDependencyPath(modulePath, dependencyPath);

      callback(path, dependencyPath, absPath);
    }
  });

  return ast;
}

/**
 * Convert CommonJS/Node `require` statements to ES `import` syntax.
 *
 * @param {string} code - Module source
 * @param {string} modulePath - Absolute path to the JS module to convert.
 * @param {Object} hasDefaultExport - A map of absolute paths to dependencies to
 *   booleans indicating whether the module has a default export or not.
 */
function convertCommonJSImports(code, modulePath, hasDefaultExport) {
  const getImportCategory = dependency =>
    dependency.startsWith(".") ? "local" : "npm";

  const ast = processCommonJSImports(
    code,
    modulePath,
    (path, requirePath, requireAbsPath) => {
      let esImportDecl;
      let cjsRequireStatement;

      if (
        types.isVariableDeclarator(path.parent) &&
        types.isVariableDeclaration(path.parentPath.parent) &&
        types.isProgram(path.parentPath.parentPath.parent)
      ) {
        // Top level `var ... = require('<path>');` statement.

        if (types.isIdentifier(path.parent.id)) {
          // var foo = require('foo');
          let specifier;
          if (hasDefaultExport[requireAbsPath]) {
            specifier = types.importDefaultSpecifier(
              types.identifier(path.parent.id.name)
            );
          } else {
            specifier = types.importNamespaceSpecifier(
              types.identifier(path.parent.id.name)
            );
          }

          esImportDecl = types.importDeclaration(
            [specifier],
            types.stringLiteral(requirePath)
          );

          // Replace the grandparent `var ... = ...` statement with an `import`
          // statement.
          cjsRequireStatement = path.parentPath.parentPath;
        } else if (types.isObjectPattern(path.parent.id)) {
          // var { foo } = require('foo');
          const specifiers = [];
          path.parent.id.properties.forEach(pattern => {
            if (!types.isIdentifier(pattern.key)) {
              throw new Error(
                `Unsupported object pattern syntax for "${requirePath}" require`
              );
            }
            if (!types.isIdentifier(pattern.value)) {
              throw new Error(
                `Unsupported object pattern syntax for "${requirePath}" require`
              );
            }

            const exportName = pattern.key.name;
            const alias = pattern.value.name;

            if (exportName === "default") {
              specifiers.push(
                types.importDefaultSpecifier(types.identifier(alias))
              );
            } else {
              specifiers.push(
                types.importSpecifier(
                  types.identifier(alias),
                  types.identifier(exportName)
                )
              );
            }
          });

          esImportDecl = types.importDeclaration(
            specifiers,
            types.stringLiteral(requirePath)
          );

          // Replace the grandparent `var ... = ...` statement with an `import`
          // statement.
          cjsRequireStatement = path.parentPath.parentPath;
        } else {
          throw new Error(`Unable to handle require for "${requirePath}"`);
        }
      } else if (
        types.isExpressionStatement(path.parent) &&
        types.isProgram(path.parentPath.parent)
      ) {
        // Top-level `require('foo');` statement.
        esImportDecl = types.importDeclaration(
          [],
          types.stringLiteral(requirePath)
        );

        // Replace the containing statement with an import declaration.
        cjsRequireStatement = path.parentPath;
      }

      let importCategory = getImportCategory(requirePath);

      if (esImportDecl && cjsRequireStatement) {
        // Copy any comments from above the `require` statement to above the new
        // `import` declaration.
        const leadingComments = cjsRequireStatement.node.leadingComments || [];
        esImportDecl.comments = [...leadingComments];

        cjsRequireStatement.replaceWith(esImportDecl);
      }
    }
  );

  const output = printAST(ast);

  // Recast does not preserve blank lines between imports after converting them
  // from `require` to `import` syntax. Since we group imports according to
  // simple rules, we can fix up the imports with a simple script.
  return groupImports(output);
}

/**
 * Test whether an object literal is a "simple" mapping of names to identifiers.
 *
 * When such expressions appear in a `module.exports` assignment they can be
 * converted to an export list (`export { foo, bar as baz, ... }`).
 */
function areValuesAllIdentifiers(objectExpressionNode) {
  return objectExpressionNode.properties.every(node =>
    types.isIdentifier(node.value)
  );
}

/**
 * Convert CommonJS exports assignments (`module.exports = ...`, `exports = ...`)
 * into ES module export declarations.
 *
 * @param {string} code
 * @return {string} The converted code
 */
function convertCommonJSExports(code) {
  const ast = processCommonJSExports(code, path => {
    let exportDecl;

    // Convert `module.exports = { name1, name2, name3: localName, ... }` exports
    // to named exports.
    if (
      types.isObjectExpression(path.node.right) &&
      areValuesAllIdentifiers(path.node.right)
    ) {
      const objNode = path.node.right;

      // List of `[exportName, localName]` tuples of exports where we can't
      // just add an `export` keyword in front of the original declaration for
      // the exported variable/function.
      const exports = [];

      // For simple exports of functions and variables which don't change the
      // name, add an `export` specifier directly before the original declaration.
      objNode.properties.forEach(propNode => {
        let handled = false;

        const localName = propNode.value.name;
        if (propNode.key.name === localName) {
          const exportBinding = path.scope.bindings[localName];
          const localPath = exportBinding.path;

          // Check that the binding refers to something that we can put `export`
          // in front of.
          if (
            types.isFunctionDeclaration(localPath) ||
            types.isClassDeclaration(localPath)
          ) {
            handled = true;
            localPath.replaceWith(
              types.exportNamedDeclaration(localPath.node, [])
            );
          }
        }

        if (!handled) {
          exports.push([propNode.key.name, localName]);
        }
      });

      // For other exports, create an `export { ... }` list where the original
      // `module.exports` assignment was.
      if (exports.length > 0) {
        const exportSpecifiers = exports.map(([name, localName]) =>
          types.exportSpecifier(
            types.identifier(name),
            types.identifier(localName)
          )
        );
        exportDecl = types.exportNamedDeclaration(null, exportSpecifiers);
      }
    } else {
      // Convert other kinds of exports to default exports.

      const exportExpr = path.node.right;
      let handled = false;

      // When `module.exports = <local function or class identifier>` is encountered,
      // put `export default` in front of the original declaration.
      if (types.isIdentifier(exportExpr)) {
        const exportBinding = path.scope.bindings[exportExpr.name];
        if (
          types.isFunctionDeclaration(exportBinding.path.node) ||
          types.isClassDeclaration(exportBinding.path.node)
        ) {
          handled = true;
          exportBinding.path.replaceWith(
            types.exportDefaultDeclaration(exportBinding.node)
          );
        }
      }

      // For other cases replace `module.exports = <expression>` with
      // `export default <expression>`.
      if (!handled) {
        exportDecl = types.exportDefaultDeclaration(exportExpr);
      }
    }

    if (exportDecl) {
      // Replace parent ExpressionStatement with export declaration.
      const leadingComments = path.node.leadingComments || [];
      exportDecl.comments = [...leadingComments];
      path.parentPath.replaceWith(exportDecl);
    } else {
      // All of the exports were processed by adding an `export` keyword in
      // front of the original declaration. Therefore we can just remove the
      // `module.exports = ...` assignment.
      path.parentPath.remove();
    }
  });

  return printAST(ast);
}

/**
 * Extract the module path from an ES `import` statement.
 */
function getImportPath(line) {
  const importMatch = line.match(/^import.*from ['"](.*)['"];?/);
  return importMatch ? importMatch[1] : null;
}

/**
 * Insert blank lines between local and third-party package imports.
 *
 * @param {string} code
 */
function groupImports(code) {
  // This function assumes the code is conventional enough that we can get
  // away with simple regex parsing rather than doing a full syntax-aware parse
  // with Babel or Recast.
  const lines = code.split("\n");
  const category = path => {
    if (path.startsWith("./") || path.startsWith("../")) {
      return "same-package";
    } else {
      return "vendor-package";
    }
  };

  let prevImportPath = null;
  for (let i = 0; i < lines.length; i++) {
    const importPath = getImportPath(lines[i]);
    if (
      prevImportPath &&
      importPath &&
      category(importPath) !== category(prevImportPath)
    ) {
      lines.splice(i, 0, "");
      ++i;
    }
    prevImportPath = importPath;
  }

  return lines.join("\n");
}

function unique(array) {
  return Array.from(new Set(array));
}

/**
 * Return the absolute path of a dependency `require`'d by `modulePath`
 *
 * @param {string} modulePath - Absolute path to calling module
 * @param {string} dependency - Path of the dependency, as specified by code in `modulePath`
 * @return {string} Absolute path to the dependency
 */
function absoluteDependencyPath(modulePath, dependency) {
  if (typeof modulePath !== "string") {
    throw new Error("Module path is not a string");
  }
  if (typeof dependency !== "string") {
    throw new Error("Dependency path is not a string");
  }

  return resolve.sync(dependency, {
    basedir: path.dirname(modulePath),
    extensions: [".js", ".coffee"]
  });
}

/**
 * Return JavaScript source for a module.
 *
 * This just reads the module if it is already JavaScript or compiles it to JavaScript
 * otherwise.
 */
function getJavaScriptSource(modulePath, transpilers = {}) {
  let code = fs.readFileSync(modulePath).toString();
  if (!modulePath.endsWith(".js")) {
    const ext = path.extname(modulePath);
    if (transpilers[ext]) {
      return transpilers[ext](code);
    } else {
      throw new Error(`Unable to compile ${modulePath} to JavaScript`);
    }
  }
  return code;
}

let srcGlob;

const program = require("commander");
program
  .option("-c, --config <path>", "Path to JSON configuration file")
  .option("--log", "Write transformed code to stdout instead of modifying file")
  .option("-i, --convert-imports")
  .option("-e, --convert-exports")
  .arguments("<paths>")
  .action(paths => {
    srcGlob = paths;
  });

program.parse(process.argv);

let config = {};
if (program.config) {
  config = JSON.parse(fs.readFileSync(program.config));
}

const srcPaths = glob.sync(srcGlob);
const transpilers = {
  ".coffee": code => require("coffee-script").compile(code)
};

// Step 1: Find all the modules `require`-d by the modules we are going to convert.
console.log(`Finding direct dependencies of files matching "${srcGlob}"...`);
const modulePaths = unique(
  srcPaths.flatMap(srcPath => {
    const requiredPaths = [];
    processCommonJSImports(srcPath, (path, requirePath, requireAbsPath) => {
      requiredPaths.push(requireAbsPath);
    });
    return requiredPaths;
  })
);

// Step 2: Analyze the exports of each module that is `require`-d to determine
// whether it has a default export. We need this information to know whether
// a statement such as `var foo = require('foo')` should be converted to
// `import foo from 'foo'` or `import * as foo from 'foo'`.
console.log("Analyzing module exports...");
let hasDefaultExport = {};
modulePaths.forEach(absPath => {
  try {
    if (absPath.endsWith(".js") || path.extname(absPath) in transpilers) {
      // If this module is JavaScript or something that this script can convert
      // to JavaScript then process it to determine whether it has a default export.
      const code = getJavaScriptSource(absPath, transpilers);
      hasDefaultExport[absPath] = detectDefaultExport(code);
    } else {
      // For other file types supported by custom loaders, make a default assumption
      // that they do have a default export as that is the most typical case.
      hasDefaultExport[absPath] = true;
    }
  } catch (err) {
    console.error(`Could not process ${absPath}`, err);
  }
});

// Apply overrides for modules where the type of default export is not correctly
// determined automatically by the logic above.
const hasDefaultExportOverrides = {};
Object.assign(hasDefaultExportOverrides, config.hasDefaultExport);

Object.keys(hasDefaultExportOverrides).forEach(dependency => {
  const absPath = resolve.sync(dependency, {
    basedir: process.cwd()
  });
  hasDefaultExport[absPath] = hasDefaultExportOverrides[dependency];
});

// Step 3. Re-process each module and convert top-level CommonJS requires to
// imports.
console.log("Converting CommonJS imports to `import ... from ...` syntax...");
srcPaths.forEach(path => {
  let code = fs.readFileSync(path).toString();

  if (program.convertImports) {
    code = convertCommonJSImports(code, path, hasDefaultExport);
  }

  if (program.convertExports) {
    code = convertCommonJSExports(code);
  }

  if (program.log) {
    console.log(code);
  } else {
    fs.writeFileSync(path, code);
  }
});
