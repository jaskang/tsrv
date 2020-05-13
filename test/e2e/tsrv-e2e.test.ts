import shell from 'shelljs'

import { execWithCache } from '../utils/shell'
import { teardownStage, setupStageWithFixture } from '../utils/fixture'

shell.config.silent = false

const testDir = 'e2e'
const fixtureName = 'build-default'
const stageName = `stage-${fixtureName}`

describe('tsdx build :: zero-config defaults', () => {
  beforeAll(() => {
    teardownStage(stageName)
    setupStageWithFixture(testDir, fixtureName, stageName)
  })

  it('should compile files into a dist directory', () => {
    const output = execWithCache('node ../dist/bin/cli.js build')
    expect(shell.test('-f', 'dist/index.js')).toBeTruthy()
    expect(shell.test('-f', 'dist/index.esm.js')).toBeTruthy()
    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy()
    expect(output.code).toBe(0)
  })

  afterAll(() => {
    // teardownStage(stageName)
  })
})
