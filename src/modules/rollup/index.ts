import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { gzipSync } from 'zlib'
import { compress } from 'brotli'
import { OutputOptions, rollup, RollupOptions, watch } from 'rollup'
import { TsrvConfig } from '../../config'
import { createRollupConfig } from './config'
import { default as CreateDebug } from 'debug'

const debug = CreateDebug('tsrv:rollup')

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const file = fs.readFileSync(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(chalk.bold(path.basename(filePath)))} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}

async function outputCjsIndex(config: TsrvConfig, rollupOptionsArray: RollupOptions[]) {
  const [cjsDev, cjsProd] = rollupOptionsArray
    .filter(i => (i.output as OutputOptions).format === 'cjs')
    .map(i => path.relative(config.distDir, (i.output as OutputOptions).file)) as [string, string]

  if (cjsDev && cjsProd) {
    await fs.outputFile(
      config.resolve('dist/index.js'),
      `'use strict'
if (process.env.NODE_ENV === 'production') {
  module.exports = require('${cjsDev}')
} else {
  module.exports = require('${cjsProd}')
}`,
      'utf8'
    )
  }
}

async function build(rollupOptions: RollupOptions) {
  const bundle = await rollup(rollupOptions)
  await bundle.write(rollupOptions.output as OutputOptions)
}

export async function execRollup(config: TsrvConfig) {
  try {
    process.env.ROLLUP_WATCH = 'false'
    const rollupOptionsArray: RollupOptions[] = config.formats.reduce((prev, format, index) => {
      prev.push(createRollupConfig({ format: format, isProd: false, outputNum: prev.length }, config))
      if (format === 'cjs') {
        prev.push(createRollupConfig({ format: format, isProd: true, outputNum: prev.length }, config))
      }
      return prev
    }, [] as RollupOptions[])
    debug(rollupOptionsArray)

    await outputCjsIndex(config, rollupOptionsArray)
    for (const rollupOptions of rollupOptionsArray) {
      await build(rollupOptions)
      checkFileSize((rollupOptions.output as OutputOptions).file)
    }
  } catch (error) {
    throw error
  }
}

export async function watchRollup(config: TsrvConfig) {
  process.env.ROLLUP_WATCH = 'true'
  const rollupOptionsArray: RollupOptions[] = config.formats.reduce((prev, format, index) => {
    prev.push({
      ...createRollupConfig({ format: format, isProd: false, outputNum: prev.length }, config),
      watch: {
        include: ['src/**/*'],
        exclude: ['node_modules/**']
      }
    })
    if (format === 'cjs') {
      prev.push({
        ...createRollupConfig({ format: format, isProd: true, outputNum: prev.length }, config),
        watch: {
          include: ['src/**/*'],
          exclude: ['node_modules/**']
        }
      })
    }
    return prev
  }, [] as RollupOptions[])
  debug(rollupOptionsArray)
  await outputCjsIndex(config, rollupOptionsArray)
  watch(rollupOptionsArray).on('event', async event => {
    if (event.code === 'START') {
      console.log()
      console.log(chalk.bold.cyan('Compiling modules...'))
    }
    if (event.code === 'ERROR') {
      console.log(chalk.bold.red('Failed to compile'))
      console.error(event.error.stack)
    }
    if (event.code === 'END') {
      console.log(event)
      console.log(chalk.bold.green('Compiled successfully'))
      console.log(`${chalk.dim('Watching for changes')}`)
    }
  })
}
