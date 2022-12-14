#!/usr/bin/env node
import { resolve } from 'pathe'
import mri from 'mri'
import consola from 'consola'
import { build } from './builder'
import { publish } from './publisher'

async function main() {
  const cwd = resolve(process.cwd(), '.')
  const args = process.argv.splice(2)
  const { _ } = mri(args)
  const [command] = _

  switch (command) {
    case 'build':
      await build(cwd, args)
      break
    case 'publish':
      await publish(cwd, args)
      break
    default:
      consola.error(`"${command}" 命令不支持!`)
      break
  }
}

main().catch(error => {
  consola.error(error.message)
  process.exit(1)
})
