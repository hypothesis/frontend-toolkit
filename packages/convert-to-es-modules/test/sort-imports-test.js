"use strict";

const { assert } = require("chai");

const { groupImportsInFile } = require("../src/sort-imports");

describe("sort-imports", () => {
  describe("groupImportsInFile", () => {
    it("sorts imports into vendor, same-package and same-dir sections", () => {
      const input = `
import localUtility from "../util/local-utility";
import LocalComponent from "./LocalComponent";
import * as vendorLib from "vendor-lib";
import vendorFunc from "vendor-func";

function MyWidget() {
}
      `;

      const expected = `
import vendorFunc from "vendor-func";
import * as vendorLib from "vendor-lib";

import localUtility from "../util/local-utility";

import LocalComponent from "./LocalComponent";

function MyWidget() {
}
`;

      const output = groupImportsInFile(input);
      assert.equal(output.trim(), expected.trim());
    });

    it("sorts each non-blank line delimited section independently", () => {
      const input = `
import zorp from "zorp";

function FooBar() {}

// Comment

import zerg from "zerg";
import bar from "bar";
`;

      const expected = `
import zorp from "zorp";

function FooBar() {}

// Comment

import bar from "bar";
import zerg from "zerg";
`;

      const output = groupImportsInFile(input);
      assert.equal(output.trim(), expected.trim());
    });

    [
      // Input with leading/trailing blank lines.
      `
function FooBar() {}

// Comment

class Woot {}
      `,

      // Input with content on the first (and last) line.
      "function FooBar() {}"
    ].forEach(input => {
      it("leaves input with no imports unchanged", () => {
        const output = groupImportsInFile(input);
        assert.equal(output.trim(), input.trim());
      });
    });

    it("preserves lines before first import", () => {
      const input = `
// This is a test
const foo = 42;

import bar from "bar";
`;
      const output = groupImportsInFile(input);
      assert.equal(output.trim(), input.trim());
    });

    it("preserves lines after last import", () => {
      const input = `
import bar from "bar";

// This is a test
const foo = 42;
`;
      const output = groupImportsInFile(input);
      assert.equal(output.trim(), input.trim());
    });
  });
});
