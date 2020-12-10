import { createBabelInputPluginFactory } from '@rollup/plugin-babel'
import babelPresetElenext from '../babelPresetElenext'

export const bablePlugin = createBabelInputPluginFactory(() => {
  return {
    options({ customOptions, ...pluginOptions }: any) {
      return {
        customOptions,
        pluginOptions
      }
    },
    config(cfg, { code, customOptions }) {
      return {
        presets: [[babelPresetElenext, customOptions]]
      }
    }
  }
})
