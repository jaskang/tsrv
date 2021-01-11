import path from 'path'
import fs from 'fs-extra'
import { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { TsrvConfig } from '../../config'
export type JestConfigOptions = Partial<Config.InitialOptions>

export async function createJestConfig(config: TsrvConfig): Promise<JestConfigOptions> {
  const jestConfigPath = path.join(config.root, 'jest.config.js')
  let jestUserConfig: JestConfigOptions = {
    globals: {},
    moduleNameMapper: {},
    transform: {}
  }
  if (await fs.pathExists(jestConfigPath)) {
    const userConfig = require(jestConfigPath)
    jestUserConfig = Object.assign({}, jestUserConfig, userConfig)
  }
  const jestConfig: JestConfigOptions = {
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'node'],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text'],
    collectCoverageFrom: ['<rootDir>/src/**/*.{vue,ts,tsx,js,jsx}'],
    watchPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: config.root,
    ...jestUserConfig,
    transform: {
      '^.+\\.vue$': require.resolve('vue-jest'),
      '^.+\\.(js|jsx)$': require.resolve('babel-jest'),
      '^.+\\.(ts|tsx)$': require.resolve('ts-jest'),
      ...jestUserConfig.transform
    },
    // transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$', '/node_modules/(?!vue)'],
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
        tsconfig: {
          ...config.tsconfigOptions.compilerOptions,
          sourceMap: false,
          target: 'esnext',
          module: 'CommonJS',
          jsx: 'preserve',
          moduleResolution: 'node',
          declaration: true,
          noUnusedLocals: true,
          resolveJsonModule: true,
          esModuleInterop: true,
          experimentalDecorators: true,
          allowSyntheticDefaultImports: true
        },
        babelConfig: { presets: [[require.resolve('./jestBabelPreset'), {}]] }
      }
    }
    // watchPlugins: [require.resolve('jest-watch-typeahead/filename'), require.resolve('jest-watch-typeahead/testname')]
  }

  return jestConfig
}
