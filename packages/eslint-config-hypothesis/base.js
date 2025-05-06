import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig(
  eslint.configs.recommended,
  {
    rules: {
      // Standard ESLint rules.
      //
      // See https://eslint.org/docs/rules/.
      //
      // Stylistic rules are omitted for things that are handled automatically
      // by Prettier.
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      'consistent-this': ['error', 'self'],
      'consistent-return': 'error',
      curly: 'error',
      'dot-notation': 'error',
      eqeqeq: 'error',
      'guard-for-in': 'error',
      'new-cap': 'error',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-extra-bind': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'one-var-declaration-per-line': ['error', 'always'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'prefer-const': ['error', { destructuring: 'all' }],
      strict: ['error', 'safe'],

      // Stylistic rules about use of ES2015+ features.
      //
      // See https://eslint.org/docs/rules/#ecmascript-6
      'no-var': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        sinon: 'readonly',
        assert: 'readonly',
      }
    },
  },

  // Tests
  {
    files: ['**/*-test.js', '**/test/*.js'],
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,

        // We use `context` instead of `define` in many cases, as it was
        // available with Mocha, before Vitest was adopted and replaced it.
        // However, every project is responsible for aliasing `define` to
        // `context` itself, by doing something in the lines of
        // `globalThis.context ??= globalThis.describe`
        context: true,
      },
    }
  }
);
