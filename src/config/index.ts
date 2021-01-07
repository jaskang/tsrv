import path from 'path'
import fs from 'fs-extra'
import { default as createDebug } from 'debug'
import { loadTsconfig, TsconfigOptions } from '../modules/tsconfig'
import { PostCSSPluginConf } from 'rollup-plugin-postcss'
import { Alias } from '@rollup/plugin-alias'

const debug = createDebug('tsrv:config')

export type FormatType = 'esm' | 'cjs'

export type TsrvUserConfig = {
  input: string
  srcDir: string
  distDir: string
  plugins: any[]
  monorepoRoot: string
  postcssOptions: PostCSSPluginConf
}

type EnvType = 'development' | 'production' | 'test'

export type TsrvConfig = {
  env: EnvType
  alias: Alias[] | { [find: string]: string }
  name: string
  input: string
  tsconfigPath: string
  tsconfigOptions: TsconfigOptions
  plugins: any[]
  srcDir: string
  distDir: string
  root: string
  monorepoRoot: string
  postcssOptions: PostCSSPluginConf
  packageJSON: Record<string, any>
  resolve: (...p: string[]) => string
}

export async function loadConfig(_configPath: string = './tsrv.config.js') {
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
      plugins: [],
      srcDir: 'src',
      distDir: 'dist',
      monorepoRoot: undefined,
      postcssOptions: {}
    } as TsrvUserConfig,
    fs.pathExistsSync(configPath) ? require(configPath) : {}
  )
  const { tsconfigPath, tsconfigOptions } = await loadTsconfig(cwd)
  const env = ['test', 'production'].includes(process.env.NODE_ENV)
    ? (process.env.NODE_ENV.toLowerCase() as EnvType)
    : 'development'
  const config: TsrvConfig = {
    env: env,
    alias: {},
    name: packageJSON.name,
    input: rootResolve(userConfig.input),
    tsconfigPath,
    tsconfigOptions,
    plugins: [],
    srcDir: rootResolve(userConfig.srcDir),
    distDir: rootResolve(userConfig.distDir),
    root: cwd,
    monorepoRoot: userConfig.monorepoRoot,
    postcssOptions: userConfig.postcssOptions,
    packageJSON: packageJSON,
    resolve: (...p: string[]) => rootResolve(...p)
  }
  debug(config)
  return config
}
