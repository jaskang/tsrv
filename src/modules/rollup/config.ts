import path from 'path'
import { RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import dynamicImport from '@rollup/plugin-dynamic-import-vars'
import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'
import autoprefixer from 'autoprefixer'

import { FormatType, TsrvConfig } from '../../config'
import { packageName } from '../../utils'
import { bablePlugin } from './bablePlugin'

export const supportedExts = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']

type CreateRollupConfigOptionType = {
  format: FormatType
  isProd: boolean
  outputNum: number
}

export function createRollupConfig(
  { format, isProd, outputNum }: CreateRollupConfigOptionType,
  config: TsrvConfig
): RollupOptions {
  return {
    input: config.input,
    output: {
      file: `${config.distDir}/${packageName(config.name)}.${format}${isProd ? '.prod' : ''}.js`,
      format: format,
      name: packageName(config.name),
      sourcemap: true,
      exports: 'named',
      banner: `/* ${config.packageJSON.name} version ${config.packageJSON.version} */`,
      compact: isProd
    },
    external: [
      ...Object.keys(config.packageJSON.dependencies || {}),
      ...Object.keys(config.packageJSON.peerDependencies || {}),
      ...['/@babel/runtime/']
    ],
    treeshake: {
      moduleSideEffects: false
    },

    onwarn(warning, warn) {
      // skip certain warnings
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
      // throw on others
      if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message)
      // Use default for everything else
      warn(warning)
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
      }),
      vue(),
      resolve({
        mainFields: ['module', 'jsnext', 'jsnext:main', 'browser', 'main'],
        extensions: supportedExts,
        preferBuiltins: false
      }),
      commonjs({
        extensions: ['.js', '.cjs'],
        include: format === 'umd' ? /\/node_modules\// : /\/regenerator-runtime\//
      }),
      dynamicImport({
        warnOnError: true,
        include: [/\.js$/],
        exclude: [/node_modules/]
      }),
      json({
        namedExports: false
      }),
      postcss({
        extract: true,
        plugins: [autoprefixer()]
      }),
      typescript({
        tsconfig: config.tsconfig,
        tsconfigDefaults: {
          exclude: [
            // all TS test files, regardless whether co-located or in test/ etc
            '**/__tests__',
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/*.spec.tsx',
            '**/*.test.tsx',
            // TS defaults below
            'node_modules',
            'bower_components',
            'jspm_packages',
            config.distDir
          ],
          compilerOptions: {
            sourceMap: true
          }
        },
        tsconfigOverride: {
          compilerOptions: {
            target: 'esnext',
            ...(outputNum > 0
              ? { declaration: false, declarationMap: false }
              : { declaration: true, declarationMap: false, declarationDir: path.join(config.distDir, '__types__') })
          }
        },
        check: outputNum === 0,
        useTsconfigDeclarationDir: true
      }),
      bablePlugin({
        exclude: 'node_modules/**',
        extensions: supportedExts,
        babelHelpers: 'bundled',
        // @ts-ignore
        tsrvConfig: config
      })
    ]
  }
}
