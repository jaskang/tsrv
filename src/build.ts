import { loadOptions } from './options'
import chalk from 'chalk'
import { join } from 'path'
import rimraf from 'rimraf'
import execRollup from './rollup/execRollup'

interface BuildOptionsType {
  cwd: string
  watch: boolean
}

export async function build(shellOptions: BuildOptionsType) {
  const options = loadOptions(shellOptions.cwd)
  console.log(chalk.gray(`Clean dist directory`))
  rimraf.sync(join(options.cwd, options.output))
  await execRollup('cjs', options)
  console.log(chalk.green(`cjs build success!`))
  await execRollup('esm', options)
  console.log(chalk.green(`esm build success!`))
  // await buildTypes({ cwd: config.cwd })
}
