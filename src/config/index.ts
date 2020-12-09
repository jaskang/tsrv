import path from 'path'
import fs from 'fs-extra'
import { default as createDebug } from 'debug'
import { loadTsconfig, TsconfigOptions } from '../modules/tsconfig'

const debug = createDebug('tsrv:config')

export type FormatType = 'esm' | 'cjs' | 'umd'

export type TsrvUserConfig = {
  input: string
  formats: FormatType[]
  srcDir: string
  distDir: string
  plugins: any[]
  monorepoRoot: string
}

export type TsrvConfig = {
  name: string
  input: string
  formats: FormatType[]
  tsconfigPath: string
  tsconfigOptions: TsconfigOptions
  plugins: any[]
  srcDir: string
  distDir: string
  root: string
  monorepoRoot: string
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

  const userConfig: TsrvUserConfig = Object.assign(
    {
      input: 'src/index.ts',
      formats: ['cjs', 'esm'],
      plugins: [],
      srcDir: 'src',
      distDir: 'dist',
      monorepoRoot: undefined
    } as TsrvUserConfig,
    fs.pathExistsSync(configPath) ? require(configPath) : {}
  )
  const { tsconfigPath, tsconfigOptions } = await loadTsconfig(cwd)
  const config: TsrvConfig = {
    name: packageJSON.name,
    input: rootResolve(userConfig.input),
    formats: userConfig.formats,
    tsconfigPath,
    tsconfigOptions,
    plugins: [],
    srcDir: rootResolve(userConfig.srcDir),
    distDir: rootResolve(userConfig.distDir),
    root: cwd,
    monorepoRoot: userConfig.monorepoRoot,
    packageJSON: packageJSON,
    resolve: (...p: string[]) => rootResolve(...p)
  }
  debug(config)
  return config
}
