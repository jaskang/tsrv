#!/usr/bin/env node
import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
import { loadConfig } from '../config'
import minimist from 'minimist'
import { execRollup, watchRollup } from '../index'

const argv = minimist(process.argv.slice(2))
if (argv.debug) {
  process.env.DEBUG = `tsrv:` + (argv.debug === true ? '*' : argv.debug)
}

const pkg = fs.readJsonSync(path.join(__dirname, '..', '..', 'package.json'))
process.env.DEBUG
program
  .version(pkg.version)
  .option('-v', '--version', () => {
    console.log(pkg.version)
  })
  .option('--debug [feat]', `[string | boolean]  show debug logs`)
  .usage('<command> [options]')

program
  .command('dev')
  .description('tsrv dev')
  .option('-f, --config [config]', '输入文件')
  .action(async options => {
    const config = await loadConfig(options.config)
    await watchRollup(config)
  })

program
  .command('build')
  .description('tsrv build')
  .option('-f, --config [config]', '输入文件')
  .action(async options => {
    // const cwd = options.config ?
    const config = await loadConfig(options.config)
    await execRollup(config)
  })

// program
//   .command('test')
//   .description('tsrv test')
//   .option('-f, --config [config]', '输入文件')
//   .action(async options => {
//     const config = await loadConfig(options.config)
//     await execJest(config)
//   })
program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
