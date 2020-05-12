import loadConfig from './loadConfig'
import chalk from 'chalk'
import { join } from 'path'
import rimraf from 'rimraf'
import { logWithSpinner, stopSpinner } from './utils/spinner'
import execRollup from './execRollup'
import buildTypes from './buildTypes'
interface BuildOptionsType {
  cwd: string
  watch: boolean
}

async function build(options: BuildOptionsType) {
  const userConfig = loadConfig(options.cwd)
  console.log(chalk.gray(`Clean dist directory`))
  rimraf.sync(join(options.cwd, 'dist'))
  logWithSpinner(`✨`, `Building ${chalk.yellow('cjs')} with rollup.`)
  await execRollup('cjs', userConfig)
  stopSpinner()
  console.log(chalk.green(`cjs build success!`))
  logWithSpinner(`✨`, `Building ${chalk.yellow('esm')} with rollup.`)
  await execRollup('esm', userConfig)
  stopSpinner()
  console.log(chalk.green(`esm build success!`))
  await buildTypes({ cwd: userConfig.cwd })
}

export default async function (options: BuildOptionsType) {
  await build(options)
}
