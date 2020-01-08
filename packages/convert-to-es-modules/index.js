"use strict";

const fs = require("fs");
const path = require("path");

const glob = require("glob");
const resolve = require("resolve");

const {
  convertCommonJSImports,
  processCommonJSImports
} = require("./src/convert-imports");
const {
  convertCommonJSExports,
  detectDefaultExport
} = require("./src/convert-exports");

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

let modulePaths = srcPaths.flatMap(srcPath => {
  const requiredPaths = [];
  const code = fs.readFileSync(srcPath).toString();
  processCommonJSImports(code, srcPath, (path, requirePath, requireAbsPath) => {
    requiredPaths.push(requireAbsPath);
  });
  return requiredPaths;
});
modulePaths = Array.from(new Set(modulePaths)); // Remove duplicates.

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
