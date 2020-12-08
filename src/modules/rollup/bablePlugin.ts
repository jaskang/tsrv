import { createBabelInputPluginFactory } from '@rollup/plugin-babel'

export const bablePlugin = createBabelInputPluginFactory(() => {
  return {
    options({ tsrvConfig, ...pluginOptions }: any) {
      return {
        customOptions: tsrvConfig,
        pluginOptions
      }
    },
    config(cfg /* Passed Babel's 'PartialConfig' object. */, { code, customOptions }) {
      return {
        presets: [[require.resolve('@babel/preset-env'), { modules: false, loose: true }]],
        plugins: [
          [require.resolve('babel-plugin-macros')],
          [require.resolve('@vue/babel-plugin-jsx'), { transformOn: true }],
          [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }]
        ]
      }
    }
  }
})
