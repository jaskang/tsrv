import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { gzipSync } from 'zlib'
import { compress } from 'brotli'
import { OutputOptions, rollup, RollupOptions, watch } from 'rollup'
import { TsrvConfig } from '../../config'
import { createRollupConfig } from './createRollupConfig'
import { default as createDebug } from 'debug'
import { buildTypes } from './buildTypes'
import { packageName } from '../../utils'

const debug = createDebug('tsrv:rollup')

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const file = fs.readFileSync(filePath)
  const fileSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath))
    )} size:${fileSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}

async function renameEsmIndex({ distDir }) {
  await fs.rename(path.join(distDir, `index.js`), path.join(distDir, `index.esm.js`))
}

async function outputCjsIndex(config: TsrvConfig, rollupOptionsArray: RollupOptions[]) {
  const [cjsProduction, cjsDevelopment] = rollupOptionsArray
    .filter(i => (i.output as OutputOptions).format === 'cjs')
    .map(i => path.relative(config.distDir, (i.output as OutputOptions).file)) as [string, string]

  if (cjsProduction && cjsDevelopment) {
    await fs.outputFile(
      config.resolve('dist/index.js'),
      `'use strict'
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${cjsProduction}')
} else {
  module.exports = require('./${cjsDevelopment}')
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
    await fs.remove(config.distDir)
    const rollupOptionsArray: RollupOptions[] = [
      createRollupConfig({ format: 'esm', isProd: true, isFirst: true }, config),
      createRollupConfig({ format: 'cjs', isProd: true, isFirst: false }, config),
      createRollupConfig({ format: 'cjs', isProd: false, isFirst: false }, config)
    ]
    for (const rollupOptions of rollupOptionsArray) {
      await build(rollupOptions)
      checkFileSize((rollupOptions.output as OutputOptions).file || `${config.distDir}/index.js`)
    }
    await renameEsmIndex(config)
    await outputCjsIndex(config, rollupOptionsArray)
    await buildTypes(config)
  } catch (error) {
    throw error
  }
}

export async function watchRollup(config: TsrvConfig) {
  process.env.ROLLUP_WATCH = 'true'
  await fs.remove(config.distDir)
  const rollupOptionsArray: RollupOptions[] = [
    {
      ...createRollupConfig({ format: 'esm', isProd: false, isFirst: true }, config),
      watch: {
        include: ['src/**/*'],
        exclude: ['node_modules/**']
      }
    },
    {
      ...createRollupConfig({ format: 'cjs', isProd: true, isFirst: false }, config),
      watch: {
        include: ['src/**/*'],
        exclude: ['node_modules/**']
      }
    },
    {
      ...createRollupConfig({ format: 'cjs', isProd: false, isFirst: false }, config),
      watch: {
        include: ['src/**/*'],
        exclude: ['node_modules/**']
      }
    }
  ]

  debug(rollupOptionsArray)
  watch(rollupOptionsArray).on('event', async event => {
    if (event.code === 'START') {
      console.log(chalk.bold.cyan('Compiling modules...'))
    }
    if (event.code === 'ERROR') {
      console.log(chalk.bold.red(`Failed to compile:${event.error.id || ''}`))
      console.log('')
      console.log(chalk.bold.red(`message: ${event.error.message}`))
      console.log('')
      // @ts-ignore
      console.log(chalk.bold.red('stack: ' + event.error.stack || event.error.filename || ''))
      console.log('')
    }
    if (event.code === 'END') {
      await renameEsmIndex(config)
      await outputCjsIndex(config, rollupOptionsArray)
      await buildTypes(config)
      console.log(chalk.bold.green('Compiled successfully'))
      console.log(`${chalk.dim('Watching for changes')}`)
    }
  })
}
