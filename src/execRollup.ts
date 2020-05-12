import { ModuleFormat, rollup, watch } from 'rollup'
import ts from 'typescript'
import babel from '@rollup/plugin-babel'
import url from '@rollup/plugin-url'
import image from '@rollup/plugin-image'
import postcss from 'rollup-plugin-postcss'
import inject from '@rollup/plugin-inject'
// import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

import autoprefixer from 'autoprefixer'

import { UserConfig } from './loadConfig'
import { join } from 'path'

function getConfig(type: 'cjs' | 'esm', userConfig: UserConfig) {
  // cjs 不给浏览器用，所以无需 runtimeHelpers
  const babelHelpers = type === 'cjs' ? 'bundled' : 'runtime'
  const babelOptions = {
    presets: [
      ['@babel/preset-typescript'],
      [
        '@babel/preset-env',
        {
          modules: type === 'esm' ? false : 'auto',
          loose: true,
          targets: { browsers: ['last 2 versions', 'IE 11'] },
          exclude: ['transform-async-to-generator', 'transform-regenerator']
        }
      ],
      ['@babel/preset-react']
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-do-expressions',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ...(babelHelpers === 'runtime'
        ? [[require.resolve('@babel/plugin-transform-runtime'), { useESModules: type === 'esm' }]]
        : []),
      ...(process.env.COVERAGE ? [require.resolve('babel-plugin-istanbul')] : [])
    ],
    exclude: /\/node_modules\//,
    babelrc: false,
    babelHelpers,
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs']
  }

  const typescriptOptions: RollupTypescriptOptions = {
    tsconfig: false,
    module: 'esnext',
    lib: ['dom', 'esnext'],
    importHelpers: true,
    sourceMap: true,
    rootDir: './src',
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    alwaysStrict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    moduleResolution: 'node',
    jsx: 'react',
    declaration: false
  }
  if (type === 'cjs') {
    typescriptOptions.declaration = true
    typescriptOptions.declarationDir = join(userConfig.cwd, 'dist', 'types')
  }
  const testExternal = id => {
    const external = [
      ...Object.keys(userConfig.pkg.dependencies || {}),
      ...Object.keys(userConfig.pkg.peerDependencies || {})
    ]
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
    url(),
    image(),
    postcss({
      extract: false,
      plugins: [autoprefixer()],
      inject: true,
      autoModules: true,
      modules: {
        localsConvention: 'camelCase'
      },
      use: [
        [
          'less',
          {
            javascriptEnabled: true
          }
        ]
      ]
    }),
    inject({}),
    replace({}),
    nodeResolve({
      mainFields: ['module', 'jsnext:main', 'main'],
      browser: true,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
      preferBuiltins: true
    }),

    typescript(typescriptOptions),
    babel(babelOptions),
    json()
  ]
  return {
    input: join(userConfig.cwd, 'src/index.ts'),
    output:
      type === 'cjs'
        ? {
            format: type,
            sourcemap: true,
            dir: join(userConfig.cwd, 'dist')
          }
        : {
            format: type,
            sourcemap: true,
            file: join(userConfig.cwd, `dist/index.esm.js`)
          },
    plugins,
    external: testExternal
  }
}

async function execRollup(type: 'cjs' | 'esm', userConfig: UserConfig) {
  const { output, ...input } = getConfig(type, userConfig)
  const bundle = await rollup(input)
  await bundle.write(output)
}

export default execRollup
