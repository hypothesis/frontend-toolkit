"use strict";

const { assert } = require("chai");

const { convertCommonJSImports } = require("../src/convert-imports");

describe("convert-imports", () => {
  describe("convertCommonJSImports", () => {
    const commanderPath = require.resolve("commander");

    it("converts CommonJS imports to namespace ES imports", () => {
      const input = `
      var commander = require("commander");
      `;
      const expected = `
      import * as commander from 'commander';
      `;

      // Pretend "commander" has no default export.
      const hasDefaultExport = { [commanderPath]: false };

      const output = convertCommonJSImports(
        input,
        "src/test.js",
        hasDefaultExport
      );

      assert.equal(output, expected);
    });

    it("converts CommonJS imports to default ES imports", () => {
      const input = `
      var commander = require("commander");
      `;
      const expected = `
      import commander from 'commander';
      `;

      // Pretend "commander" does have a default export.
      const hasDefaultExport = { [commanderPath]: true };

      const output = convertCommonJSImports(
        input,
        "src/test.js",
        hasDefaultExport
      );

      assert.equal(output, expected);
    });

    it("converts named imports to ES imports", () => {
      const input = `
      var { foo, bar } = require("commander");
      var { foo: wibble } = require("commander");
      `;
      const expected = `
      import { foo, bar } from 'commander';
      import { foo as wibble } from 'commander';
      `;

      const hasDefaultExport = {};

      const output = convertCommonJSImports(
        input,
        "src/test.js",
        hasDefaultExport
      );

      assert.equal(output, expected);
    });
  });
});
