import fs from 'fs-extra'
import path from 'path'

import { TsrvConfig, loadTsrvConfig } from './tsrvconfig'

export interface TsrvOptions extends TsrvConfig {
  cwd: string
  pkg: any
}

export function loadOptions(cwd: string): TsrvOptions {
  const userConfig = loadTsrvConfig(cwd)
  return {
    ...userConfig,
    cwd,
    pkg: fs.readJSONSync(path.join(cwd, 'package.json'))
  }
}
