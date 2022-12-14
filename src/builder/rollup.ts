import type { RollupOptions, OutputOptions, OutputChunk } from 'rollup'
import { rollup } from 'rollup'
import { resolve, extname, relative, dirname } from 'pathe'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import chalk from 'chalk'
import byteSize from 'byte-size'

import consola from 'consola'

import type { BuildOptions } from '../build'
import { buildLess, buildSass } from './css'
import fs from 'fs-extra'

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.mjs', '.cjs', '.js', '.jsx', '.json']

export async function getRollupOptions(options: BuildOptions) {
  const srcPath = resolve(options.root, options.pkgDir, options.srcDir)
  const distPath = resolve(options.root, options.pkgDir, options.distDir)

  const rollupOptions: RollupOptions = {
    input: options.input,
    output: {
      // manualChunks(id, { getModuleInfo }) {
      //   const p = relative(srcPath, id)

      //   consola.log(id)
      //   if (!id.startsWith(srcPath)) {
      //     const info = getModuleInfo(id)
      //     console.log('manualChunks', info)
      //     return 'common-chunk'
      //   }
      // },
      chunkFileNames: '[name].js',
      generatedCode: 'es2015',
      sourcemap: options.sourcemap,
      strict: false,
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: srcPath,
      ...options.output,
      dir: distPath,
    },

    onwarn(warning, handler) {
      if (
        warning.code === 'UNRESOLVED_IMPORT' ||
        warning.code === 'CIRCULAR_DEPENDENCY' ||
        warning.code === 'EMPTY_BUNDLE'
      ) {
        return
      }
      return handler(warning)
    },
    external: options.external || [/node_modules/],
    plugins: [
      replace({ preventAssignment: true, values: { ...options.pluginOptions.replace } }),
      alias({ ...options.pluginOptions.alias }),

      nodeResolve({
        extensions: DEFAULT_EXTENSIONS,
        preferBuiltins: true,
        ...options.pluginOptions.nodeResolve,
      }),

      esbuild({
        include: /\.[jt]sx?$/, // default, inferred from `loaders` option
        exclude: /node_modules/, // default
        sourceMap: true, // default
        minify: options.minify,
        target: 'es2017',
        define: options.define,
      }),

      commonjs({
        extensions: DEFAULT_EXTENSIONS,
        ignoreTryCatch: true,
        ...options.pluginOptions.commonjs,
      }),
    ],
  }
  return rollupOptions
}

export async function rollupBuild(options: BuildOptions) {
  const srcPath = resolve(options.root, options.pkgDir, options.srcDir)
  const distPath = resolve(options.root, options.pkgDir, options.distDir)

  const jsEntries = options.input.filter(i => i.endsWith('.ts') || i.endsWith('.js'))
  const otherEntries = options.input.filter(i => !i.endsWith('.ts') && !i.endsWith('.js'))

  const rollupOptions = await getRollupOptions({ ...options, input: jsEntries })
  const buildResult = await rollup(rollupOptions)

  const { output } = await buildResult.write(rollupOptions.output as OutputOptions)
  const chunkFileNames = new Set<string>()
  const outputChunks = output.filter(e => e.type === 'chunk') as OutputChunk[]
  for (const entry of outputChunks) {
    chunkFileNames.add(entry.fileName)
    if (entry.isEntry) {
      consola.success(
        `${chalk.green('[CJS]')} ${options.distDir}/${entry.fileName} size: ${byteSize(
          Buffer.byteLength(entry.code, 'utf8')
        )}`
      )
    }
  }

  for (const i of otherEntries) {
    const input = resolve(options.root, i)
    const ext = extname(input)
    if (['.less', '.scss'].includes(ext)) {
      const fileName = relative(srcPath, input.replace(/\.(less|scss)/, '.wxss'))
      const output = resolve(distPath, fileName)
      if (ext === '.less') {
        await buildLess(input, output)
      } else {
        await buildSass(input, output)
      }
      consola.success(`${chalk.cyan('[CSS]')} ${options.distDir}/${fileName}`)
    } else {
      const fileName = relative(srcPath, input)
      const output = resolve(distPath, fileName)
      await fs.copy(input, output)
      consola.success(`${chalk.gray('[CPY]')} ${options.distDir}/${fileName}`)
    }
  }
}
