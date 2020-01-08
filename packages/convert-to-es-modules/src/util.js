"use strict";

const traverse = require("@babel/traverse").default;
const types = require("@babel/types");

const recast = require("recast");

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

module.exports = {
  parse,
  printAST,
  traverse,
  types
};
