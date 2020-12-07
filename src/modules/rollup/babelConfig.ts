import { createBabelInputPluginFactory } from '@rollup/plugin-babel'

export const createBablePlugin = createBabelInputPluginFactory(() => {
  return {
    options({ tsrvConfig, ...pluginOptions }: any) {
      return {
        customOptions: tsrvConfig,
        pluginOptions
      }
    },
    config(cfg /* Passed Babel's 'PartialConfig' object. */, { code, customOptions }) {
      return {
        presets: [
          {
            name: '@babel/preset-env',
            // targets: customOptions.targets,
            modules: false,
            loose: true
          }
        ],
        plugins: [
          { name: 'babel-plugin-macros' },
          ['@vue/babel-plugin-jsx', { transformOn: true }],
          { name: 'babel-plugin-annotate-pure-calls' },
          {
            name: 'babel-plugin-polyfill-regenerator',
            method: 'usage-pure'
          },
          {
            name: '@babel/plugin-proposal-class-properties',
            loose: true
          }
        ]
      }
    }
  }
})
