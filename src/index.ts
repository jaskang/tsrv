import type { BuildConfig } from './build';
import { getRollupOptions } from './builder';

export function defineConfig(fn: () => BuildConfig): BuildConfig {
  const a = getRollupOptions;
  return fn();
}
