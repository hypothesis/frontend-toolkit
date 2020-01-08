"use strict";

const { assert } = require("chai");

const {
  convertCommonJSExports,
  detectDefaultExport
} = require("../src/convert-exports");

describe("convert-exports", () => {
  describe("convertCommonJSExports", () => {
    it("converts `module.exports = <identifier>` assignments to default exports", () => {
      const input = `
      // Do something.
      function foo() {
      }

      module.exports = foo;
      `;

      const expected = `
      // Do something.
      export default function foo() {
      }
      `;

      const output = convertCommonJSExports(input);
      assert.equal(output, expected);
    });

    it("adds export declarations to named exports", () => {
      const input = `
      function foo() {}
      class Bar {}

      module.exports = { foo, Bar };
      `;

      const expected = `
      export function foo() {}
      export class Bar {}
      `;

      const output = convertCommonJSExports(input);
      assert.equal(output, expected);
    });

    it("uses correct export name for aliased exports", () => {
      const input = `
      function foo() {}

      module.exports = { boop: foo };
      `;

      const expected = `
      function foo() {}

      export { foo as boop };
      `;

      const output = convertCommonJSExports(input);
      assert.equal(output, expected);
    });

    it("creates an export list for more complex named exports", () => {
      const input = `
      var foo = 1, bar = 2;

      module.exports = { foo, bar };
      `;

      const expected = `
      var foo = 1, bar = 2;

      export { foo, bar };
      `;

      const output = convertCommonJSExports(input);
      assert.equal(output, expected);
    });

    it("creates an export list for more complex default exports", () => {
      const input = `
      module.exports = function () {};
      `;
      const expected = `
      export default function () {};
      `;
      const output = convertCommonJSExports(input);
      assert.equal(output, expected);
    });
  });

  describe("detectDefaultExport", () => {
    it("returns `false` if module exports an object literal where all values are identifiers", () => {
      const code = `module.exports = { foo: bar, meep }`;
      assert.equal(detectDefaultExport(code), false);
    });

    it("returns `true` if module exports an object-literal with non-identifier values", () => {
      const code = `module.exports = { foo: 'abc' };`;
      assert.equal(detectDefaultExport(code), true);
    });

    it("returns `true` if module exports a non-object literal", () => {
      const code = `module.exports = SomeClass;`;
      assert.equal(detectDefaultExport(code), true);
    });
  });
});
