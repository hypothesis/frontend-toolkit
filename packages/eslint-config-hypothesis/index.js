import eslint from '@eslint/js';
import mocha from 'eslint-plugin-mocha';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  mocha.configs.flat.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': reactHooks,
    },
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
      'no-use-before-define': ['error', { functions: false }],
      'no-useless-concat': 'error',
      'one-var-declaration-per-line': ['error', 'always'],
      strict: ['error', 'safe'],

      // Stylistic rules about use of ES2015+ features.
      //
      // See https://eslint.org/docs/rules/#ecmascript-6
      'no-var': 'error',

      // plugin:react/recommended rules
      //
      // See https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
      // and https://reactjs.org/docs/hooks-rules.html#eslint-plugin
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

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
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        sinon: 'readonly',
        assert: 'readonly',
      }
    },
    settings: {
      react: {
        version: '18.0'
      }
    },
  }
];
