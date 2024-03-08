// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  // must use single `ignores` key
  {
    ignores: ['dist/', '**/*.module.less.d.ts'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,

  {
    rules: {
      //
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-constant-condition': 'off',

      // ts
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',

      // '@typescript-eslint/consistent-type-imports': ['warn', { 'fixStyle': 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'separate-type-imports' }],
    },
  },
)
