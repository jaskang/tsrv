#!/usr/bin/env node
import path from 'path'
import fs from 'fs-extra'
import program from 'commander'
// import minimist from 'minimist'
import build from '../build'

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
  .option('-w, --watch', '监听')
  .option('-d, --dir [dir]', '输入文件')
  .action(options => {
    const cwd = options.dir ? path.relative(process.cwd(), options.dir) : process.cwd()
    build({ cwd: cwd, watch: options.watch })
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
