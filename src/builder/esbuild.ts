import { build, type BuildResult } from 'esbuild'
import { resolve } from 'pathe'
import type { BuildOptions } from './config'

let result: BuildResult | null = null

export async function buildJS(inputs: string[], options: BuildOptions) {
  const absWorkingDir = resolve(options.root, options.packageDir)
  if (options.watch && result?.rebuild) {
    const ret = await result.rebuild()
    return ret
  }
  result = await build({
    entryPoints: inputs,
    entryNames: '[dir]/[name]',
    outbase: options.srcDir,
    outdir: options.distDir,
    absWorkingDir: absWorkingDir,
    define: options.define || {},
    external: options.external || [],
    banner: {
      // js: `// banner`,
    },
    footer: {},
    format: 'cjs',
    platform: 'browser',
    target: 'es2018',
    minify: options.minify,
    sourcemap: options.sourcemap,
    metafile: true,
    // 重复构建缓存
    incremental: options.watch,
  })
  return result
}
