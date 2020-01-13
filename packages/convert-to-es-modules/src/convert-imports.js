"use strict";

const path = require("path");

const resolve = require("resolve");

const { parse, printAST, traverse, types } = require("./util");
const { groupImportsInFile } = require("./sort-imports");

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
 * Find all the CommonJS/Node `require` calls in a source file and invoke
 * `callback` with `(path, dependencyPath, absoluteDependencyPath)` where
 * `path` is a Babel AST path.
 */
function processCommonJSImports(code, modulePath, callback) {
  const ast = parse(code);
  traverse(ast, {
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
  return groupImportsInFile(output);
}

module.exports = { convertCommonJSImports, processCommonJSImports };
