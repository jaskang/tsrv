import { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { TsrvConfig } from '../../config'
export type JestConfigOptions = Partial<Config.InitialOptions>

export function createJestConfig(config: TsrvConfig): JestConfigOptions {
  const jestConfig: JestConfigOptions = {
    preset: require.resolve('ts-jest'),
    globals: {
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
    },
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.vue$': require.resolve('vue-jest')
      // '.(ts|tsx)$': require.resolve('ts-jest/dist'),
      // '.(js|jsx)$': [require.resolve('babel-jest'),]
    },
    moduleNameMapper: pathsToModuleNameMapper(config.tsconfigOptions.compilerOptions.paths || {}, {
      prefix: '<rootDir>/'
    }),
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['vue', 'ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{vue,ts,tsx,js,jsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: config.root
    // watchPlugins: [require.resolve('jest-watch-typeahead/filename'), require.resolve('jest-watch-typeahead/testname')]
  }

  return jestConfig
}
