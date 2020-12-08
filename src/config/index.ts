import path from 'path'
import fs from 'fs-extra'
import { default as CreateDebug } from 'debug'

const debug = CreateDebug('tsrv:config')

export type FormatType = 'esm' | 'cjs' | 'umd'

export type TsrvUserConfig = {
  input: string
  formats: FormatType[]
  srcDir: string
  distDir: string
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

  const configPath = rootResolve(_configPath)
  const tsconfigPath = rootResolve('tsconfig.json')

  const userConfig: TsrvUserConfig = Object.assign(
    {
      input: 'src/index.ts',
      formats: ['cjs', 'esm'],
      plugins: [],
      srcDir: 'src',
      distDir: 'dist'
    } as TsrvUserConfig,
    fs.pathExistsSync(configPath) ? require(configPath) : {}
  )

  const config: TsrvConfig = {
    name: packageJSON.name,
    input: rootResolve(userConfig.input),
    formats: userConfig.formats,
    tsconfig: fs.pathExistsSync(tsconfigPath) ? tsconfigPath : undefined,
    plugins: [],
    srcDir: rootResolve(userConfig.srcDir),
    distDir: rootResolve(userConfig.distDir),
    root: cwd,
    packageJSON: packageJSON,
    resolve: (...p: string[]) => rootResolve(...p)
  }
  debug(config)
  return config
}
