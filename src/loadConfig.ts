import fs from 'fs-extra'
import { join } from 'path'
import chalk from 'chalk'

export interface UserConfig {
  format: ['cjs', 'esm']
  cwd: string
  pkg: any
}
function loadConfig(cwd: string): UserConfig {
  const configPath = join(cwd, '.msbuildrc.js')
  const pkg = fs.readJsonSync(join(cwd, 'package.json'))

  if (fs.pathExistsSync(configPath)) {
    const config = require(configPath)
    return {
      cwd,
      pkg,
      ...config
    }
  } else {
    console.error(chalk.red(`配置文件未定义: "${configPath}"`))
    process.exit()
  }
}

export default loadConfig
