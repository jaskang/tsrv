import { TsrvConfig } from '../../config'
import * as jest from 'jest'
import { createJestConfig } from './createJestConfig'

export async function execJest(config: TsrvConfig) {
  process.env.BABEL_ENV = 'test'
  process.env.NODE_ENV = 'test'
  process.on('unhandledRejection', err => {
    throw err
  })
  const jestConfig = createJestConfig(config)
  jest.run(['--config', JSON.stringify(jestConfig)])
}
