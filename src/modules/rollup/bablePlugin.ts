import { createBabelInputPluginFactory } from '@rollup/plugin-babel'
import { TsrvConfig } from '../../config'
import { createBabelConfig } from '../bable'
export const bablePlugin = createBabelInputPluginFactory(() => {
  return {
    options({ tsrvConfig, ...pluginOptions }: any) {
      return {
        customOptions: tsrvConfig,
        pluginOptions
      }
    },
    config(cfg, { code, customOptions }) {
      return createBabelConfig(customOptions as TsrvConfig, customOptions.env)
    }
  }
})
