import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // plugin:react/recommended rules
      //
      // See https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
      // and https://reactjs.org/docs/hooks-rules.html#eslint-plugin
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Prop validation should be performed by TypeScript/JSDoc.
      'react/prop-types': 'off',
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: '18.0'
      }
    },
  }
];
