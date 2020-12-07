import path from 'path'
import fs from 'fs-extra'
import { default as CreateDebug } from 'debug'

const debug = CreateDebug('tsrv:config')

export type FormatType = 'es' | 'cjs' | 'umd'

export type TsrvUserConfig = {
  name: string
  input: string
  formats: FormatType[]
  tsconfig: string
  plugins: any[]
}

export type TsrvConfig = {
  name: string
  input: string
  formats: FormatType[]
  tsconfig: string
  plugins: any[]
  srcDir: string
  distDir: string
  root: string
  packageJSON: Record<string, any>
  resolve: (...p: string[]) => string
}

export async function loadConfig(_configPath: string = './tsrc.config.js') {
  const cwd = process.cwd()
  const rootResolve = (...paths: string[]) => path.resolve(cwd, ...paths)
  const packagePath = rootResolve('package.json')

  if (!fs.existsSync(packagePath)) {
    throw new Error(`There is no package.json file in the current directory -> ${cwd}`)
  }

  const packageJSON = fs.readJSONSync(packagePath)
  if (!packageJSON.name) {
    throw new Error(`The package.json file must have the attribute: name`)
  }

  const configPath = path.resolve(cwd, _configPath)

  let config: TsrvConfig = {
    name: packageJSON.name,
    input: '',
    formats: ['cjs', 'es'],
    tsconfig: rootResolve('tsconfig.json'),
    plugins: [],
    srcDir: rootResolve('src'),
    distDir: rootResolve('dist'),
    root: cwd,
    packageJSON: packageJSON,
    resolve: (...p: string[]) => rootResolve(...p)
  }
  if (fs.pathExistsSync(configPath)) {
    try {
      config = Object.assign(config, require(configPath))
    } catch (error) {
      debug(error)
    }
  }
  return config
}
