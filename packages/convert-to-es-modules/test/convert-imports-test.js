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

      assert.equal(output.trim(), expected.trim());
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

      assert.equal(output.trim(), expected.trim());
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

      assert.equal(output.trim(), expected.trim());
    });

    [
      // Input imports already grouped.
      `
        var foo = require("commander");
        var bar = require("commander");

        var local = require("./convert-imports-test");
        var local2 = require("../src/convert-imports");
      `,

      // Input imports not grouped.
      `
        var foo = require("commander");
        var bar = require("commander");
        var local = require("./convert-imports-test");
        var local2 = require("../src/convert-imports");
      `
    ].forEach(input => {
      it("inserts a blank line between local and vendor imports", () => {
        const expected = `
        import * as foo from 'commander';
        import * as bar from 'commander';

        import * as local2 from '../src/convert-imports';

        import * as local from './convert-imports-test';
        `;

        const hasDefaultExport = {};

        const output = convertCommonJSImports(
          input,
          __filename,
          hasDefaultExport
        );

        assert.equal(output.trim(), expected.trim());
      });
    });

    it("strips 'use strict' literals", () => {
      const input = `
'use strict';

const foo = require("commander");

function test() {
  "use strict";
}
      `;

      const expected = `
import * as foo from 'commander';

function test() {
}
`;

      const hasDefaultExport = {};
      const output = convertCommonJSImports(
        input,
        __filename,
        hasDefaultExport
      );

      assert.equal(output.trim(), expected.trim());
    });
  });
});
