# eslint-config-hypothesis

A [shareable ESLint configuration](https://eslint.org/docs/developer-guide/shareable-configs)
for Hypothesis frontend projects.

To use it:

1. Add `eslint-config-hypothesis` as a dependency to your project
2. Add the config's peer dependencies (see `peerDependencies` in `package.json`)
   to your project's dependencies. Some of them are required only for some
   entry points.
3. Add an ESLint config file to the repository which extends the desired
   "hypothesis" config. For example, a `eslint.config.js` file with the
   following content:
   ```js
   import hypothesisBase from 'eslint-config-hypothesis/base';
   import hypothesisTS from 'eslint-config-hypothesis/ts';
   import hypothesisJSX from 'eslint-config-hypothesis/jsx';
   
   export default [
    ...hypothesisBase,
    ...hypothesisTS, // Optionally add this if the project uses TypeScript
    ...hypothesisJSX, // Optionally add this if the project uses JSX
    {
      // Other project config
    },
   ];
   ```

## Rule notes

- In `/base` entry point, all `recommended` rules from `@eslint/js` are enabled
  and the config assumes that you are using mocha for tests
- In `/jsx` entry point, all `react.recommended`, `react.jsx-runtime`,
  `react-hooks` and `jsx-a11y.recommended` rules are enabled, assuming
  React/Preact is used for any interactive UI
- In `/ts` entry point, all `typescript-eslint.recommended` rules are enabled
- All rules are configured to produce errors and not warnings. This is based on
  the principle that an issue is either worth fixing or should be ignored, and
  warnings just add noise
- Code formatting rules that are obsoleted by automated formatters are disabled.
  You should [*use Prettier*](https://prettier.io) to auto-format code.
