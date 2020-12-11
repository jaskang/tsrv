import { TsrvConfig } from '../../config'
import { createJestConfig } from './createJestConfig'
import { run } from 'jest'

export async function execJest(config: TsrvConfig) {
  process.env.BABEL_ENV = 'test'
  process.env.NODE_ENV = 'test'
  process.on('unhandledRejection', err => {
    throw err
  })
  const jestConfig = await createJestConfig(config)
  await run(['--passWithNoTests', '--config', JSON.stringify(jestConfig)])
}
