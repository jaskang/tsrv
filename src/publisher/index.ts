import mri from 'mri'
import { bump } from './bump'
import type { PublishArgs } from './config'

export async function publish(cwd: string, argv: string[]) {
  const { _: commands, ...args } = mri<PublishArgs>(argv)
  const [, target] = commands

  console.log(bump('1.2.3', 'major'))
  console.log(bump('1.2.3', 'minor'))
  console.log(bump('1.2.3', 'patch'))
  return ''
}
