import type { BuildConfig } from './builder/config'
export { bump } from './publisher'
export function defineConfig(config: BuildConfig): BuildConfig {
  return config
}
