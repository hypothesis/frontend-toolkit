# eslint-config-hypothesis

A [shareable ESLint configuration](https://eslint.org/docs/developer-guide/shareable-configs)
for Hypothesis frontend projects.

To use it:

1. Add `eslint-config-hypothesis` as a dependency to your project
2. Add the config's peer dependencies (see `peerDependencies` in `package.json`)
   to your project's dependencies
3. Add an ESLint config file to the repository which extends the "hypothesis"
   config. For example, a `eslint.config.js` file with the following content:

   ```js
   import hypothesis from 'eslint-config-hypothesis';

   export default [
     ...hypothesis,
     {
       // Other project config
     },
   ];
   ```

## Rule notes

- All `recommended` rules from `@eslint/js` are enabled
- All rules are configured to produce errors and not warnings. This is based on
  the principle that an issue is either worth fixing or should be ignored, and
  warnings just add noise
- The config assumes that you are using mocha for tests and React/Preact for
  any interactive UI
- Code formatting rules that are obsoleted by automated formatters are disabled.
  You should [*use Prettier*](https://prettier.io) to auto-format code.
