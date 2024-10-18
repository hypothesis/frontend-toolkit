import eslint from '@eslint/js';
import mocha from 'eslint-plugin-mocha';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  mocha.configs.flat.recommended,
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

      // mocha rules
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-mocha-arrows': 'off',
      'mocha/no-setup-in-describe': 'off',
      'mocha/max-top-level-suites': 'off',
      'mocha/consistent-spacing-between-blocks': 'off',
      'mocha/no-top-level-hooks': 'off',
      'mocha/no-sibling-hooks': 'off',
      'mocha/no-identical-title': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        sinon: 'readonly',
        assert: 'readonly',
      }
    },
  }
];
