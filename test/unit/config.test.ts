import path from 'path'
import { loadTsrvConfig } from '../../src/options/tsrvConfig'

describe('loadUserConfig', () => {
  it('load tsrv.config.ts', () => {
    expect(loadTsrvConfig(path.join(__dirname, '../e2e/fixtures/build-default'))).toMatchObject({
      format: ['esm']
    })
  })
})
