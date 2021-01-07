import chalk from 'chalk'
import { default as createDebug } from 'debug'

const debug = createDebug('tsrv: jestBabelPreset')

export function createBabelConfig(env: 'development' | 'production' | 'test') {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current'
          },
          modules: 'commonjs'
        }
      ]
    ].filter(Boolean),
    plugins: [[require.resolve('@vue/babel-plugin-jsx'), { optimize: true }]].filter(Boolean)
  }
}

export default function jestBabelPreset(api, opts) {
  if (!opts) {
    opts = {}
  }
  const env = api.env()

  debug(`env:${chalk.redBright(chalk.bold(env))}`)
  const ret = createBabelConfig(env)
  return ret
}
