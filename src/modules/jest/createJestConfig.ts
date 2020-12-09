import path from 'path'
import fs from 'fs-extra'
import { Config } from '@jest/types'
// import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { TsrvConfig } from '../../config'
export type JestConfigOptions = Partial<Config.InitialOptions>

export async function createJestConfig(config: TsrvConfig): Promise<JestConfigOptions> {
  const jestConfigPath = path.join(config.root, 'jest.config.js')
  let jestUserConfig: JestConfigOptions = {
    globals: {},
    moduleNameMapper: {}
  }
  if (await fs.pathExists(jestConfigPath)) {
    const userConfig = require(jestConfigPath)
    jestUserConfig = Object.assign({}, jestUserConfig, userConfig)
  }
  const jestConfig: JestConfigOptions = {
    transform: {
      '\\.vue$': require.resolve('vue-jest'),
      '\\.[jt]sx?$': [
        require.resolve('babel-jest'),
        {
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: { node: 'current' },
                modules: 'commonjs'
              }
            ],
            [
              require.resolve('@babel/preset-typescript'),
              {
                allExtensions: true,
                isTSX: true,
                jsxPragma: 'preserve'
              }
            ]
          ],
          plugins: [
            [require.resolve('@vue/babel-plugin-jsx'), { transformOn: true }],
            ['@babel/plugin-syntax-dynamic-import']
          ]
        }
      ]
      // '.(ts|tsx)$': require.resolve('ts-jest'),
    },
    // transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['vue', 'ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['<rootDir>/src/**/*.{vue,ts,tsx,js,jsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: config.root,
    ...jestUserConfig,
    moduleNameMapper: {
      // ...pathsToModuleNameMapper(config.tsconfigOptions.compilerOptions.paths || {}, {
      //   prefix: '<rootDir>/'
      // }),
      ...jestUserConfig.moduleNameMapper
    },
    globals: {
      ...jestUserConfig.globals,
      __DEV__: true,
      __TEST__: true
    }

    // watchPlugins: [require.resolve('jest-watch-typeahead/filename'), require.resolve('jest-watch-typeahead/testname')]
  }

  return jestConfig
}

// console.log(process.env.NODE_ENV)

// module.exports = api => {
//   const isTest = api.env('test')
//   return {
//     presets: [
//       ['@babel/env', isTest ? { targets: { node: 'current' }, modules: 'commonjs' } : { loose: true, modules: false }],
//       [
//         '@babel/preset-typescript',
//         {
//           allExtensions: true,
//           isTSX: true,
//           jsxPragma: 'preserve'
//         }
//       ]
//     ],
//     plugins: [
//       ['@babel/plugin-transform-runtime'],
//       [
//         '@vue/babel-plugin-jsx',
//         {
//           transformOn: true,
//           optimize: true
//         }
//       ],
//       ['@babel/plugin-syntax-dynamic-import'],
//       ['@babel/plugin-proposal-export-default-from'],
//       ['@babel/plugin-proposal-class-properties', { loose: true }],
//       // 支持 optional chaining (.?)
//       ['@babel/plugin-proposal-optional-chaining'],
//       // 支持 ?? operator
//       ['@babel/plugin-proposal-nullish-coalescing-operator']
//     ]
//   }
// }
