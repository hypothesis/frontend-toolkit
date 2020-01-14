# convert-to-es-modules

A script to assist with conversion of Hypothesis projects from
CommonJS to ES module syntax. It is built on [recast](https://github.com/benjamn/recast)
and Babel.

The script makes some assumptions about the content of the projects which are
true for the projects we need to use it with.

A notable feature of this script compared to alternatives is that it tries to
be intelligent about deciding whether to convert a CommonJS require (`var foo = require("foo")`)
to a namespace import (`import * as foo from "foo"`) or a default import
(`import foo from "foo"`). The script examines the contents of the target module,
which is assumed to be a CommonJS/Node module, and looks for assignments to
`module.exports` or `exports`. If it finds an assignment to an object literal
(`module.exports = { … }`) it assumes that the module does not have a default
export and therefore it uses a namespace import. If it finds an assignment to
anything else (eg. a function, an identifier) it assumes that the module has
a default export.

## Usage

To convert all JavaScript files in the `src` directory of a project from
CommonJS to ES modules:

```sh
$ yarn install
$ cd path/to/your/project

# nb. `/path/to/frontend-toolkit` refers to the absolute path where you have
# cloned this repository.

$ node /path/to/frontend-toolkit/convert-to-es-modules/index.js -i -e 'src/**/*.js'
```

The `-i` flag enables conversion of imports. The `-e` flag enables conversion
of exports.

## Options

The script accepts several options. Use the `--help` argument for details.

## Configuration

The tool accepts extended configuration in a JSON file specified via the
`--config` argument:

```
$ node convert-to-es-modules/index.js --config config.json 'src/**/*.js'
```

The following configuration options are available:

**hasDefaultExport**

Override the tool's detection of whether a module has a default export or not:

```
{
  "hasDefaultExport": {
    "katex": false
  }
}
```

This option is useful if the tool's simple heuristics do not correctly detect
whether an npm package should be treated as having a default export or not.

## Limitations

There are several limitations / scenarios which this script will not handle
automatically. The recommended approach to using it is to refactor occurrences
of these patterns before running this script, although you can also fix them up
afterwards:

- Only `var … = require` statements at the top level of a module are converted
  to imports. This is because `import` statements must occur at the top level
  of a file (ie. outside of any conditionals, loops or functions).
- Detection of whether to use namespace imports (`import * as foo from "foo"`)
  vs default imports (`import foo from "foo"`) is based on heuristics about
  what the imported module assigns to `module.exports` (if it is a CommonJS
  module) or whether it has an `export default` declaration (if it is an ES
  module). The heuristic is to assume that `module.exports` assignments where
  the right-hand side is an object literal with only identifiers as values
  (eg. `module.exports = { foo, bar: baz }`) should be converted to namespace
  imports. Anything else results in a default export. This heuristic may not
  always be correct.
- CommonJS modules which logically have both a default export (eg. a function)
  and named exports (eg. auxilliary functions) are implemented by assigning
  properties to the object which is the default export. When converting to ES
  modules the idiomatic approach would be to have a default export and separate
  named exports. This script cannot make this change automatically.

## References

For information on parsing and transforming code with Babel, see the
[Babel Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/README.md).

To see the parsed structures of various code, see [AST Explorer](https://astexplorer.net).

For information about Recast, which enables preserving unmodified parts of the code,
see the [Recast repo](https://github.com/benjamn/recast).
