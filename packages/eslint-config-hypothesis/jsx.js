import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from './react.js';

export default [
  ...react,
  jsxA11y.flatConfigs.recommended,
];
