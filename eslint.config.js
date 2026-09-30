// @ts-check
import eslint from '@eslint/js';
import header from '@tony.ganchev/eslint-plugin-header';
import angular from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**']
  },
  ...defineConfig(
    {
      files: ['**/*.ts'],
      extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        ...angular.configs.tsRecommended,
        prettierConfig
      ],
      plugins: {
        header
      },
      processor: angular.processInlineTemplates,
      rules: {
        'header/header': [
          'error',
          'line',
          {
            pattern: ' Copyright © 20\\d{2} One Identity LLC. ALL RIGHTS RESERVED.',
            template: ' Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.'
          }
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['Components/*'],
                message: 'Use the @oneidentity/iris-ui entry points instead.'
              },
              {
                group: ['Storybook/*'],
                message: 'Use @storybook/* alias instead.'
              },
              {
                group: ['../*', './../*', '../../*'],
                message: 'Use the @oneidentity/iris-ui or @storybook/* alias instead.'
              }
            ]
          }
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'iris',
            style: 'camelCase'
          }
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'iris',
            style: 'kebab-case'
          }
        ],
        curly: 'warn',
        'no-alert': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-multi-assign': 'error',
        'no-nested-ternary': 'error',
        'no-implicit-coercion': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
          }
        ]
      }
    },
    {
      files: ['**/*.html'],
      extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
      rules: {}
    }
  ),
  ...storybook.configs['flat/recommended'],
  {
    files: ['Storybook/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'story',
          style: 'kebab-case'
        }
      ]
    }
  },
  {
    // Replaces the workspace rule rather than extending it: relative paths are the
    // sanctioned way to navigate inside the library, so the base `../*` ban must not
    // apply here. Everything else the base rule forbids is carried over below.
    files: ['Components/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@oneidentity/iris-ui',
              message: 'Library source must NOT import its own root entry point. Use a relative path.'
            },
            {
              name: '@oneidentity/iris-ui/table',
              message: 'Library source must NOT import a leaf entry point.'
            }
          ],
          patterns: [
            {
              group: ['Components/*', 'Storybook/*'],
              message: 'Use a relative path instead of a workspace-rooted one.'
            },
            {
              group: ['**/public-api'],
              message: 'Internal files must NOT import from public-api. Use a relative path to the source file.'
            }
          ]
        }
      ]
    }
  }
];
