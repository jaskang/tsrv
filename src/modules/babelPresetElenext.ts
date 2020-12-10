import chalk from 'chalk'
import { default as createDebug } from 'debug'

const debug = createDebug('tsrv: babel-preset-elenext')

export function createBabelConfig(env: 'development' | 'production' | 'test') {
  return {
    presets: [
      [
        '@babel/preset-env',
        env === 'test'
          ? {
              targets: {
                node: 'current'
              },
              modules: 'commonjs'
            }
          : { modules: false, loose: true }
      ]
    ].filter(Boolean),
    plugins: [
      'babel-plugin-macros',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      // ['@babel/plugin-transform-runtime'],
      // obj?.['foo']?.bar?.baz
      '@babel/plugin-proposal-optional-chaining',
      // var foo = object.foo ?? "default";
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-object-rest-spread',
      // export v from 'mod';
      '@babel/plugin-proposal-export-default-from',
      // export * as ns from 'mod';
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import'
    ].filter(Boolean)
  }
}

export default function babelPresetElenext(api, opts) {
  if (!opts) {
    opts = {}
  }
  const env = api.env()

  debug(`env:${chalk.redBright(chalk.bold(env))}`)
  const ret = createBabelConfig(env)
  return ret
}
