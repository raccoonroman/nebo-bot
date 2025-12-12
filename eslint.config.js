import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },

  prettier,
];
