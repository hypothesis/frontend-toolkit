"use strict";

const { parse, printAST, traverse, types } = require("./util");

/**
 * Move the comments from before one source AST node to a destination AST node.
 */
function transferComments(fromNode, toNode) {
  const comments = fromNode.leadingComments || [];
  fromNode.leadingComments = [];
  fromNode.comments = [];
  toNode.comments = [...comments];
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
 * Find all the CommonJS/Node `module.exports` assignments in a source file and invoke
 * `callback` with the Babel AST path.
 *
 * @param {string|AST} code - Source code of module as either source code or a parsed AST
 * @param {Function} callback - Callback invoked with Babel AST path object
 */
function processCommonJSExports(code, callback) {
  const ast = typeof code === "string" ? parse(code) : code;

  traverse(ast, {
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
            const exportDecl = types.exportNamedDeclaration(localPath.node, []);

            // Move any comments above the function/class declaration so that
            // they appear above the export declaration instead of between
            // the `export` keyword and the function/class declaration.
            transferComments(localPath.node, exportDecl);

            localPath.replaceWith(exportDecl);
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
            types.identifier(localName),
            types.identifier(name)
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
          const exportDecl = types.exportDefaultDeclaration(
            exportBinding.path.node
          );

          // Move any comments above the function/class declaration so that
          // they appear above the export declaration instead of between
          // the `export` keyword and the function/class declaration.
          transferComments(exportBinding.path.node, exportDecl);

          exportBinding.path.replaceWith(exportDecl);
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
 * Analyze the exports of a CommonJS or ES module and return `true` if the module
 * should be considered to have a "default" export.
 */
function detectDefaultExport(code) {
  let hasDefaultExport = false;

  const ast = parse(code);

  processCommonJSExports(ast, path => {
    hasDefaultExport =
      !types.isObjectExpression(path.node.right) ||
      !areValuesAllIdentifiers(path.node.right);
  });

  // Find ES default exports.
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      hasDefaultExport = true;
    }
  });

  return hasDefaultExport;
}

module.exports = { convertCommonJSExports, detectDefaultExport };
