#!/usr/bin/env node
import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
import { execRollup, watchRollup } from '../index'
import { loadConfig } from '../config'

const pkg = fs.readJsonSync(path.join(__dirname, '..', '..', 'package.json'))

program
  .version(pkg.version)
  .option('-v', '--version', () => {
    console.log(pkg.version)
  })
  .usage('<command> [options]')

program
  .command('build')
  .description('rollup 打包')
  .option('-f, --config [config]', '输入文件')
  .action(async options => {
    // const cwd = options.config ?
    const config = await loadConfig(options.config)
    await execRollup(config)
  })

program
  .command('watch')
  .description('rollup 打包')
  .option('-f, --config [dir]', '输入文件')
  .action(async options => {
    const config = await loadConfig(options.config)
    await watchRollup(config)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
