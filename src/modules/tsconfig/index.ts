import path from 'path'
import fs from 'fs-extra'
import { default as createDebug } from 'debug'
import { CompilerOptions } from 'typescript'

const debug = createDebug('tsrv:tsconfig')

export interface TsconfigOptions {
  exclude?: string[]
  include?: string[]
  compilerOptions: CompilerOptions
}

export async function loadTsconfig(
  root: string
): Promise<{
  tsconfigPath: string
  tsconfigOptions: TsconfigOptions
}> {
  const _tsconfig = path.join(root, 'tsconfig.json')
  const tsconfigPath = (await fs.pathExists(_tsconfig)) ? _tsconfig : undefined
  let userConfig: any = {}
  if (tsconfigPath) {
    userConfig = await fs.readJSON(tsconfigPath)
  }
  debug(`userConfig:`, userConfig)
  const { compilerOptions, ...otherUserConfig } = userConfig
  const mergedCompilerOptions: CompilerOptions = Object.assign(
    {
      baseUrl: '.',
      outDir: 'dist',
      sourceMap: false,
      target: 'esnext',
      module: 'esnext',
      moduleResolution: 'node',
      allowJs: false,
      strict: true,
      noUnusedLocals: true,
      experimentalDecorators: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      removeComments: false,
      jsx: 'preserve',
      lib: ['esnext', 'dom'],
      types: ['jest', 'node'],
      rootDir: '.',
      paths: {}
    },
    userConfig.compilerOptions
  )
  const tsconfigOptions = Object.assign(
    {
      exclude: ['node_modules', 'bower_components', 'jspm_packages'],
      compilerOptions: mergedCompilerOptions
    },
    otherUserConfig
  )
  return { tsconfigPath, tsconfigOptions }
}
