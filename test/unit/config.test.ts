import path from 'path'
import { loadOptions } from '../../src/options'

describe('loadUserConfig', () => {
  it('load tsrv.config.ts', () => {
    const options = loadOptions(path.join(__dirname, '../e2e/fixtures/build-default'))
    expect(options[0]).toMatchObject({
      format: 'cjs'
    })
  })
})
