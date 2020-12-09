import path from 'path'
import fs from 'fs-extra'
import { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { TsrvConfig } from '../../config'
export type JestConfigOptions = Partial<Config.InitialOptions>

export async function createJestConfig(config: TsrvConfig): Promise<JestConfigOptions> {
  const jestConfigPath = path.join(config.root, 'jest.config.js')
  let jestUserConfig: JestConfigOptions = {}
  if (await fs.pathExists(jestConfigPath)) {
    jestUserConfig = require(jestConfigPath)
  }
  const jestConfig: JestConfigOptions = {
    preset: path.join(path.dirname(require.resolve('ts-jest')), '..'),
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.vue$': require.resolve('vue-jest')
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['vue', 'ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{vue,ts,tsx,js,jsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: config.root,
    ...jestUserConfig,
    modulePaths: [config.monorepoRoot, ...jestUserConfig.modulePaths].filter(Boolean),
    moduleNameMapper: {
      ...pathsToModuleNameMapper(config.tsconfigOptions.compilerOptions.paths || {}, {
        prefix: '<rootDir>/'
      }),
      ...jestUserConfig.moduleNameMapper
    },
    globals: {
      ...jestUserConfig.globals,
      __DEV__: true,
      __TEST__: true,
      'ts-jest': {
        tsconfig: config.tsconfigOptions.compilerOptions,
        babelConfig: {
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: {
                  node: 'current'
                }
              }
            ]
          ],
          plugins: [[require.resolve('@vue/babel-plugin-jsx'), { transformOn: true }]]
        }
      }
    }

    // watchPlugins: [require.resolve('jest-watch-typeahead/filename'), require.resolve('jest-watch-typeahead/testname')]
  }

  return jestConfig
}
