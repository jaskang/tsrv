import chalk from 'chalk'
import { default as createDebug } from 'debug'

const debug = createDebug('tsrv: babel-preset-elenext')

export function babelPresetElenext(api, opts) {
  if (!opts) {
    opts = {}
  }
  const env = api.env()
  // var isEnvDevelopment = env === 'development'
  // var isEnvProduction = env === 'production'
  var isEnvTest = env === 'test'

  console.log(`babel env:${chalk.redBright(chalk.bold(env))}`)

  return {
    presets: [
      [
        require('@babel/preset-env').default,
        isEnvTest
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
      require('babel-plugin-macros'),
      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
      [require('@babel/plugin-proposal-class-properties').default, { loose: true }],
      [require('@babel/plugin-transform-runtime').default],
      // obj?.['foo']?.bar?.baz
      require('@babel/plugin-proposal-optional-chaining').default,
      // var foo = object.foo ?? "default";
      require('@babel/plugin-proposal-nullish-coalescing-operator').default,
      require('@babel/plugin-proposal-object-rest-spread').default,
      // export v from 'mod';
      require('@babel/plugin-proposal-export-default-from').default,
      // export * as ns from 'mod';
      require('@babel/plugin-proposal-export-namespace-from').default,
      require('@babel/plugin-transform-modules-commonjs').default,
      require('@babel/plugin-syntax-dynamic-import').default
    ].filter(Boolean)
  }
}
