import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    rules: {
      // Upgrade TS rules from warning to error.
      '@typescript-eslint/no-unused-vars': 'error',

      // Disable TS rules that we dislike.
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-this-alias': 'off',

      // Enforce consistency in cases where TypeScript supports old and new
      // syntaxes for the same thing.
      //
      // - Require `<var> as <type>` for casts
      // - Require `import type` for type imports. The corresponding rule for
      //   exports is not enabled yet because that requires setting up type-aware
      //   linting.
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
