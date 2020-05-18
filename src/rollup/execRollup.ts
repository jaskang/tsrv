import { ModuleFormat, rollup, watch, WatcherOptions } from 'rollup'
import ts from 'typescript'
import babel from '@rollup/plugin-babel'
import babelPresetTsrv from './babel-preset-tsrv'
import url from '@rollup/plugin-url'
import image from '@rollup/plugin-image'
import postcss from 'rollup-plugin-postcss'
// import inject from '@rollup/plugin-inject'
import vuePlugin from 'rollup-plugin-vue'
// import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript, { RPT2Options } from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

import execa from 'execa'
import autoprefixer from 'autoprefixer'

import { TsrvOptions } from '../options'
import { join } from 'path'
import ora from 'ora'
import chalk from 'chalk'
import { logError } from '../utils/error'

function getConfig({ cwd, output, outDir, declaration, tsconfig, pkg, env }: TsrvOptions) {
  const typescriptOptions: RPT2Options = {
    typescript: ts,
    tsconfigDefaults: {
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.test.tsx',
        'node_modules',
        'bower_components',
        'jspm_packages',
        outDir
      ],
      compilerOptions: {
        sourceMap: true,
        declaration: true,
        jsx: 'react'
      }
    },
    tsconfigOverride: {
      compilerOptions: {
        target: 'ESNext',
        declarationDir: `${outDir}/__types__`,
        // don't output declarations more than once
        ...(declaration ? {} : { declaration: false, declarationMap: false })
      }
    },
    check: true,
    useTsconfigDeclarationDir: true
  }

  const testExternal = id => {
    const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]
    const excludes = []
    const externalRE = new RegExp(`^(${external.join('|')})($|/)`)
    if (external.length === 0) {
      return false
    }
    if (excludes.includes(id)) {
      return false
    }
    if (id === 'babel-plugin-transform-async-to-promises/helpers') {
      return false
    }
    return externalRE.test(id)
  }

  const plugins = [
    vuePlugin({
      exclude: /\/node_modules\//,
      target: 'browser',
      exposeFilename: true,
      preprocessStyles: true,
      cssModulesOptions: {
        localsConvention: 'camelCase'
      }
    }),
    url(),
    image(),

    postcss({
      plugins: [autoprefixer()],
      modules: {
        generateScopedName: '[local]___[hash:base64:5]',
        localsConvention: 'camelCase'
      },
      include: /&module=.*\.css$/
    }),
    postcss({
      plugins: [autoprefixer()],
      include: /(?<!&module=.*)\.css$/
    }),
    // postcss({ include: /(?<!&module=.*)\.css$/ }),
    nodeResolve({
      mainFields: ['module', 'jsnext:main', 'main'],
      browser: true,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.vue'],
      preferBuiltins: true
    }),

    typescript(typescriptOptions),
    babel({
      exclude: /\/node_modules\//,
      babelrc: false,
      babelHelpers: 'runtime',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
      presets: [babelPresetTsrv]
    }),

    // inject({}),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    json()
  ]
  return {
    input: join(cwd, 'src/index.ts'),
    output: output,
    plugins,
    external: testExternal
  }
}

export async function execRollup(options: TsrvOptions) {
  try {
    const { output, ...input } = getConfig(options)
    const bundle = await rollup(input)
    await bundle.write(output)
  } catch (error) {
    throw error
  }
}

export async function watchRollup(optionsGroup: TsrvOptions[]) {
  const wathcOptions = optionsGroup.map(options => {
    const config = getConfig(options)
    return {
      ...config,
      watch: {
        silent: true,
        include: ['src/**'],
        exclude: ['node_modules/**']
      } as WatcherOptions
    }
  })
  const spinner = ora().start()
  watch(wathcOptions).on('event', async event => {
    if (event.code === 'START') {
      spinner.start(chalk.bold.cyan('Compiling modules...'))
    }
    if (event.code === 'ERROR') {
      spinner.fail(chalk.bold.red('Failed to compile'))
      logError(event.error)
    }
    if (event.code === 'END') {
      spinner.succeed(chalk.bold.green('Compiled successfully'))
      console.log(`${chalk.dim('Watching for changes')}`)
    }
  })
}
