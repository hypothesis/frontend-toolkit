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

$ node /path/to/frontend-toolkit/convert-to-es-modules/index.js 'src/**/*.js'
```
