import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';

const PATTERN_FEATURES = '**/features/**';
const PATTERN_APP = '**/app/**';
const UI_FORBIDDEN = [
  PATTERN_FEATURES,
  PATTERN_APP,
  'react',
  'react-dom',
  'zustand',
];

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/no-cycle': 'error',
    },
  },
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
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'sonarjs/cognitive-complexity': ['error', 10],
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-identical-functions': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-named-as-default': 'off',
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
            'ExportDefaultDeclaration forbidden in src; use named exports.',
        },
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message: 'dangerouslySetInnerHTML is forbidden.',
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
        { name: 'document', message: 'Domain forbidden document' },
        { name: 'fetch', message: 'Domain forbidden fetch' },
        { name: 'localStorage', message: 'Domain forbidden storage' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ai/**', ...UI_FORBIDDEN],
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
              group: [PATTERN_FEATURES, '!./**'],
              message: 'Features cannot import other features',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*'],
    ignores: ['src/shared/state/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/domain/**',
                '**/ai/**',
                PATTERN_FEATURES,
                PATTERN_APP,
              ],
              message: 'Shared layer cannot import higher layers',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/state/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ai/**', ...UI_FORBIDDEN],
              message: 'Shared state selectors cannot import UI or AI layers',
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
              group: UI_FORBIDDEN,
              message: 'AI layer imports domain and config only',
            },
          ],
        },
      ],
    },
  }
);
