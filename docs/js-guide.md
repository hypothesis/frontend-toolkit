# JavaScript / TypeScript guide

This document explains the tools and conventions that we use to maintain
quality and consistency of our JavaScript and TypeScript code.

The rationales for various conventions are documented briefly _in italics_.
Exceptions are noted **in bold**.

## Language style guide

### Use of newer ES language features

Projects should generally prefer native ES language features over equivalent
idioms from earlier versions of the language (eg. classes over constructor functions,
`import` over `require(...)`).

_The native features typically enable better tooling._

Projects may use any ES language features which meet all of the following criteria:

1. Supported by the tooling we use (Babel, ESLint)
2. Supported natively in the stable release of at least two major browsers.

   _Waiting for the feature to advance far enough to be natively supported
   reduces maintenance problems due to using language features which are not
   widely supported or which are revised significantly during the standardization
   process._

3. Can be transpiled for supported browsers that do not natively support the
   feature without excessive overhead.

   _Some language features (generators, as a historical example) are difficult
   to transpile for older browsers without introducing a lot of code that
   slows startup and makes debugging difficult._

As an exception, [JSX](https://reactjs.org/docs/introducing-jsx.html) is used for
creating UI components.

### Module naming

Modules should use lowercase, hyphen-separated names (`helpful-module.js`).

**Exception:** Modules whose primary export is a Preact component should use a
CamelCase name that matches the component name (eg. `ShinyButton.js`). _This is a
React/Preact ecosystem convention._

### Import structure

Imports should be placed at the top of a module, grouped into sections by their
relation to the current project:

1. Platform (node, browser) imports
2. Third-party imports
3. Imports from other directories in the current package
4. Imports from the same directory in the current package

Within each group import lines should be sorted alphabetically by module path.

```js
import { readFile } from 'fs';

import { render } from 'markdown';

import { fetchData } from './data-source';
import { formatDate } from './utils/date';
```

### Default exports

Avoid default exports. Use named exports instead.

_Using named exports helps with grep-ability as it encourages the
symbol to have the same name everywhere it is used. Automated refactoring tools
are more likely to update all references to a symbol when renaming it._

**Exception:** Modules whose primary export is a single Preact component should
default-export that component. _This is a React/Preact ecosystem convention._

### Variable declarations

Variables should be declared with `const` where possible, or `let` if not.

_Use of `const` makes it clear that a variable is only assigned in one place._

### Identifier naming

Variables, functions (except for Preact components) and object properties should
use camelCase naming. Acronyms should be lower-case if they are the first "word"
of an identifier or upper-case otherwise. Classes and Preact components should
use PascalCase naming.

_These conventions match web platform APIs and the Preact/React ecosystem_.

Correct examples:

```js
const pdfTitle = ...;

function getPDFTitle() {
   ...
}

class PDFIntegration { ... };
```

**Exception:** Objects containing deserialized API response bodies or serializable API request bodies may
use non-camel-case identifier names.

#### Ref naming

Preact does not allow the `ref` prop to be accessed by on non-HTML components. Instead it
offers a wrapper method called [forwardRef](https://preactjs.com/guide/v10/switching-to-preact/#forwardref)
to extract the ref for you. Unfortunately the wrapper method is included with `preact/compat` which
is a library we currently don't import nor want to because of a number of global side effects. For
this reason, we simply use a custom property with a "Ref" suffix and pass the ref object to
that property. For example, `buttonRef`, `panelRef` or `fooBarRef` would all be valid names.
It is then up to the component to pull out the ref passed to that prop and attach it to the
underlying `HTMLElement`.

e.g.

```tsx
export type FooBarProps = {
  fooBarRef: Ref<HTMLInputElement>;
};

export default function FooBar({
  fooBarRef
}: FooBarProps) {
   return (
      <input type="text" ref={fooBarRef}/>
   )
}
```

## Formatting code

All of our projects use [Prettier](https://prettier.io) to format JavaScript code,
with the following `.prettierrc` configuration:

```json
{
  "arrowParens": "avoid",
  "singleQuote": true
}
```

All other config options are set to the Prettier defaults.

## Lint setup

Our projects use [ESLint](https://eslint.org) to:

- Catch common JavaScript coding errors
- Detect HTML usage errors in Preact components
- Identify potential accessibility errors in Preact components
- Ensure correct usage of the "hooks" APIs in Preact components
- Encourage stylistic consistency across projects (although many basic aspects
  of code style are handled by Prettier)

Projects should use the `eslint-config-hypothesis` package from this repository
as a base configuration, with any additional project-specific configuration added
on top.

[Lint suppressions](https://eslint.org/docs/2.13.1/user-guide/configuring#disabling-rules-with-inline-comments)
may be used where there are reasonable reasons to ignore a particular lint warning.
Try to scope any suppressions to the narrowest scope possible and add a comment
to explain any that may be non-obvious to another developer reading the code
in future.

## Documenting and type-checking code

### JSDoc

It is recommended to use [JSDoc](https://jsdoc.app) to document function
parameters and object properties.

Hypothesis uses the variant of JSDoc understood by the TypeScript compiler.
See [the reference](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
in the TypeScript handbook for guidance on supported JSDoc syntax as well as
details on how to specify various types correctly.

### Typechecking

Production code which runs in the browser should be written in TypeScript. Tooling which runs
directly in Node can be written in JavaScript. JS scripts may have type annotations in the form
of JSDoc comments.

Unit and integration tests are generally written in JS and not type-checked.
This is because our tests often create mocks/fakes which take liberties when implementing the type
they stand in for (eg. only implementing the used subset of an API). As a consequence any type
checking would have to be relaxed (eg. using `any` frequently).

See the [Typechecking FAQs](typechecking-faqs.md) page for recommendations on JSDoc / TypeScript usage in projects.

## Testing

Hypothesis makes use of extensive unit testing to help prevent regressions.
Our standard test setup is to use [Mocha](https://mochajs.org) and
[Chai](https://www.chaijs.com) together with [Karma](http://karma-runner.github.io/latest/index.html).
We also use [Istanbul](https://istanbul.js.org) for generating code coverage reports.

Many unit tests make use of the [mockable-imports](https://github.com/robertknight/babel-plugin-mockable-imports)
Babel plugin to enable mocking dependencies of the code being tested in order
to isolate the unit test from implementation details of the dependency.

## Creating UI components

Interactive UI components are created using [Preact](https://preactjs.com), a
lightweight implementation of the [React](https://reactjs.org) APIs.

If you are unfamiliar with React or Preact, reading the [React tutorial](https://reactjs.org/docs/hello-world.html)
is recommended to familiarize yourself with the concepts and best practices.
Even though we use Preact, we frequently refer to the React documentation
for guidance on conceptual issues.

React/Preact provide several two main APIs for authoring components: function
and class-based. Hypothesis uses [function components](https://reactjs.org/docs/components-and-props.html)
together with the ["hooks" API](https://reactjs.org/docs/hooks-intro.html)
for managing internal state and effects.

### Testing components

For Preact UI component tests, we use [Enzyme](https://enzymejs.github.io/enzyme/)
in the "Full DOM Rendering" mode. The "Shallow rendering" mode is avoided
and instead components imported by the component being tested are mocked using
the same `mockable-imports` Babel plugin that is used to mock imports in other code.

_See [this blog post](https://robertknight.me.uk/posts/shallow-rendering-revisited/)
for the rationale for avoiding shallow rendering but continuing to mock child
components using a different method. The [Testing Overview](https://reactjs.org/docs/testing.html)
section of the React docs also has useful general guidance._
