import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'max-lines': [
        'error',
        { max: 200, skipBlankLines: false, skipComments: false },
      ],
      'max-lines-per-function': [
        'error',
        { max: 60, skipBlankLines: false, skipComments: false },
      ],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'max-lines-per-function': [
        'error',
        { max: 90, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  {
    files: ['src/**/*'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            'ExportDefaultDeclaration is forbidden in src; use named exports.',
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Domain layer cannot access window' },
        { name: 'document', message: 'Domain layer cannot access document' },
        { name: 'fetch', message: 'Domain layer cannot access fetch' },
        {
          name: 'localStorage',
          message: 'Domain layer cannot access localStorage',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'zustand',
                '**/features/**',
                '**/ai/**',
                '**/app/**',
              ],
              message: 'Domain layer cannot import UI or framework modules',
            },
            {
              group: ['**/shared/**', '!**/shared/result*'],
              message: 'Domain layer can only import result from shared',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '!./**'],
              message: 'Features cannot import other features',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/domain/**',
                '**/features/**',
                '**/ai/**',
                '**/app/**',
              ],
              message: 'Shared layer cannot import higher layers',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ai/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/features/**',
                '**/app/**',
                'react',
                'react-dom',
                'zustand',
              ],
              message: 'AI layer imports domain and config only',
            },
          ],
        },
      ],
    },
  }
);
