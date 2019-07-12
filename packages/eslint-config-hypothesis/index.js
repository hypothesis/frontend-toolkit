'use strict';

module.exports = {
  env: {
    mocha: true,
    commonjs: true,
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  globals: {
    assert: false,
    sinon: false,
    Promise: false,
  },
  rules: {
    // eslint:recommended rules
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'comma-dangle': ['error', 'always-multiline'],
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

    // ES2015+ style rules
    'no-var': 'error',

    // plugin:react/recommended rules
    'react/self-closing-comp': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // mocha rules
    'mocha/no-exclusive-tests': 'error',
  },

  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: ['mocha', 'react', 'react-hooks'],

  settings: {
    react: {
      pragma: 'createElement',
      version: '16.8',
    },
  },
};
