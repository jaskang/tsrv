import path from 'path'
import fs from 'fs-extra'
import { transform } from '@babel/core'
import requireFromString from 'require-from-string'

export interface TsrvConfig {
  format: Array<'cjs' | 'esm' | 'umd'>
  output: string
}

const defaultTsrvConfig: TsrvConfig = {
  format: ['cjs', 'esm'],
  output: 'dist'
}

export function loadTsrvConfig(cwd): TsrvConfig {
  const configfiles = ['tsrv.config.js', 'tsrv.config.ts']
  let userConfig = {}
  for (const file of configfiles) {
    const configPath = path.join(cwd, file)
    if (fs.pathExistsSync(configPath)) {
      const content = transform(fs.readFileSync(configPath, 'utf8'), {
        babelrc: false,
        configFile: false,
        filename: configPath,
        presets: [
          [
            require('@babel/preset-env'),
            {
              targets: {
                node: 'current'
              }
            }
          ],
          configPath.endsWith('.ts') && require('@babel/preset-typescript')
        ].filter(Boolean)
      })
      const m = requireFromString((content && content.code) || '', configPath)
      userConfig = m.default || m
    }
  }
  return {
    ...defaultTsrvConfig,
    ...userConfig
  } as TsrvConfig
}
