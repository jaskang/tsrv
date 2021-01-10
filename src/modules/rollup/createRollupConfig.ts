import fs from 'fs-extra'
import { RollupOptions } from 'rollup'
import aliasPlugin from '@rollup/plugin-alias'
import commonjsPlugin from '@rollup/plugin-commonjs'
import replacePlugin from '@rollup/plugin-replace'
import resolvePlugin from '@rollup/plugin-node-resolve'
import jsonPlugin from '@rollup/plugin-json'
import typescriptPlugin from '@rollup/plugin-typescript'
import vuePlugin from 'rollup-plugin-vue'
import postcssPlugin from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import { esbuildPlugin } from './plugins/esbuild'

import { FormatType, TsrvConfig } from '../../config'
import { packageName } from '../../utils'
import vueJsxPlugin from './plugins/jsx'
import path from 'path'

export const supportedExts = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']

type CreateRollupConfigOptionType = {
  format: FormatType
  isProd: boolean
  isFirst: boolean
}

export function createRollupConfig(
  { format, isProd, isFirst }: CreateRollupConfigOptionType,
  config: TsrvConfig
): RollupOptions {
  return {
    input: config.input,
    output: {
      file:
        format === 'cjs'
          ? `${config.distDir}/${packageName(config.name)}.${format}${isProd ? '.production' : '.development'}.js`
          : undefined,
      dir: format === 'esm' ? config.distDir : undefined,
      format: format,
      name: packageName(config.name),
      sourcemap: true,
      exports: 'named',
      banner: `/* ${config.packageJSON.name} version ${config.packageJSON.version}\n*/`
    },
    external: [
      ...Object.keys(config.packageJSON.dependencies || {}),
      ...Object.keys(config.packageJSON.peerDependencies || {}),
      ...['/@babel/runtime/'],
      /^(vue)$/,
      !isFirst && /\.(scss|sass|less|css)$/
    ].filter(Boolean),
    treeshake: {
      moduleSideEffects: false
    },
    preserveSymlinks: true,
    onwarn(warning, warn) {
      // skip sourceMap warnings
      if (
        warning.message ===
        `@rollup/plugin-typescript: Typescript 'sourceMap' compiler option must be set to generate source maps.`
      ) {
        return
      }
      // skip certain warnings
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
      // throw on others
      if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message)
      // Use default for everything else
      warn(warning)
    },
    plugins: [
      aliasPlugin({ entries: config.alias }),
      resolvePlugin({
        extensions: supportedExts,
        preferBuiltins: false
      }),
      postcssPlugin({
        inject: false,
        extract: isFirst && path.join(config.distDir, `${packageName(config.name)}.css`),
        ...config.postcssOptions,
        plugins: Array.isArray(config.postcssOptions.plugins)
          ? [...config.postcssOptions.plugins, autoprefixer()]
          : [autoprefixer()]
      }),
      jsonPlugin({
        preferConst: true,
        namedExports: true
      }),
      commonjsPlugin({
        include: [/node_modules/],
        extensions: ['.js', '.cjs']
      }),
      replacePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
        'process.env.': `({}).`
      }),
      vuePlugin(),
      isFirst &&
        typescriptPlugin({
          exclude: [
            // all TS test files, regardless whether co-located or in test/ etc
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/*.spec.tsx',
            '**/*.test.tsx',
            // TS defaults below
            'node_modules',
            'bower_components',
            'jspm_packages'
          ],
          target: 'esnext',
          rootDir: config.srcDir,
          sourceMap: false,
          declaration: true,
          declarationMap: false,
          module: 'esnext',
          declarationDir: path.join(config.distDir, '__temp__'),
          jsx: 'preserve'
        }),
      // typescriptPlugin({
      //   tsconfigOverride: {
      //     exclude: [
      //       // all TS test files, regardless whether co-located or in test/ etc
      //       '**/*.spec.ts',
      //       '**/*.test.ts',
      //       '**/*.spec.tsx',
      //       '**/*.test.tsx',
      //       // TS defaults below
      //       'node_modules',
      //       'bower_components',
      //       'jspm_packages',
      //       'dist'
      //     ],
      //     compilerOptions: {
      //       target: 'esnext',
      //       sourceMap: false,
      //       declaration: true,
      //       module: 'esnext',
      //       allowSyntheticDefaultImports: true,
      //       declarationDir: path.join(config.distDir, '__temp__'),
      //       jsx: 'preserve'
      //     }
      //   },
      //   check: true,
      //   useTsconfigDeclarationDir: true
      // })
      vueJsxPlugin(),
      esbuildPlugin({})
    ].filter(Boolean)
  }
}
