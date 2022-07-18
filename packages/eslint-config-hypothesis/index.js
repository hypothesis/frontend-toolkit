'use strict';

module.exports = {
  env: {
    // Specify global variables and ES language version.
    //
    // See https://eslint.org/docs/user-guide/configuring#specifying-environments
    es2021: true,
    mocha: true,
    commonjs: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  globals: {
    assert: 'readonly',
    sinon: 'readonly',
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
    'no-multiple-empty-lines': 'error',
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
  },

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: ['mocha', 'react', 'react-hooks'],

  settings: {
    react: {
      version: '18.0',
    },
  },
};
