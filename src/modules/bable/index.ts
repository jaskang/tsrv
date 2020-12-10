import { TsrvConfig } from '../../config'
export { babelPresetElenext } from './babel-preset-elenext'

export function createBabelConfig(config: TsrvConfig, env: 'test' | 'development' | 'production') {
  const defaultConfig = {
    presets: [['@babel/preset-env', { modules: false, loose: true }]],
    plugins: [
      '@babel/plugin-transform-runtime',
      ['@vue/babel-plugin-jsx', { optimize: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      // ?.
      '@babel/plugin-proposal-optional-chaining',
      // ??
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import'
    ]
  }

  if (env === 'test') {
    return Object.assign({}, defaultConfig, {
      presets: [['@babel/preset-env', { targets: { node: true }, modules: 'commonjs' }]]
    })
  }
  return defaultConfig
}
