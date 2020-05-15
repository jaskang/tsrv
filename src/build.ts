import { loadOptions } from './options'
import chalk from 'chalk'
import { join } from 'path'
import rimraf from 'rimraf'
import execRollup from './rollup/execRollup'
import buildTypes from './extractor'

interface BuildOptionsType {
  cwd: string
  watch: boolean
}

export async function build(shellOptions: BuildOptionsType) {
  const options = loadOptions(shellOptions.cwd)
  console.log(chalk.gray(`Clean dist directory`))
  rimraf.sync(join(options[0].cwd, options[0].outDir))
  for (const option of options) {
    console.log(chalk.green(`${option.format} building`))
    await execRollup(option)
    console.log(chalk.green(`${option.format} build success!`))
  }
  // await execRollup('esm', options)
  // console.log(chalk.green(`esm build success!`))
  // await buildTypes(options[0])
}
