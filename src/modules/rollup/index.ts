import chalk from 'chalk'
import { ModuleFormat, rollup, RollupOptions, watch, WatcherOptions } from 'rollup'
import { TsrvConfig } from '../../config'
import { createRollupConfig } from './config'

async function build(rollupOptions: RollupOptions) {
  const bundle = await rollup(rollupOptions)
  await bundle.write(Array.isArray(rollupOptions.output) ? rollupOptions.output[0] : rollupOptions.output)
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
    for (const rollupOptions of rollupOptionsArray) {
      await build(rollupOptions)
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

  watch(rollupOptionsArray).on('event', async event => {
    if (event.code === 'START') {
      console.log()
      console.log(chalk.bold.cyan('Compiling modules...'))
    }
    if (event.code === 'ERROR') {
      console.log(chalk.bold.red('Failed to compile'))
      console.error(event.error)
    }
    if (event.code === 'END') {
      console.log(chalk.bold.green('Compiled successfully'))
      console.log(`${chalk.dim('Watching for changes')}`)
    }
  })
}
