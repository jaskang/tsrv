import path from 'path'
import fs from 'fs-extra'
import { transform } from '@babel/core'
import requireFromString from 'require-from-string'
import { OutputOptions } from 'rollup'
import { safePackageName, safeVariableName } from '../utils'
import { CompilerOptions } from 'typescript'
import chalk from 'chalk'

type formatType = 'cjs' | 'esm' | 'umd'

export interface TsrvConfig {
  formats: formatType[]
  outDir: string
  globals: { [name: string]: string }
}

export interface TsrvOptions {
  cwd: string
  outDir: string
  env: 'development' | 'production'
  format: formatType
  pkg: any
  declaration: boolean
  tsconfig: { compilerOptions?: CompilerOptions }
  output: OutputOptions
}

const defaultTsrvConfig: TsrvConfig = {
  formats: ['esm'],
  outDir: 'dist',
  globals: { react: 'React', 'react-native': 'ReactNative' }
}

function loadTsrvConfig(cwd): TsrvConfig {
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
    ...userConfig,
    formats: ['esm']
  } as TsrvConfig
}

export function loadOptions(cwd: string): TsrvOptions[] {
  const userConfig = loadTsrvConfig(cwd)
  const tsconfigPath = path.join(cwd, 'tsconfig.json')
  const tsconfig = fs.existsSync(tsconfigPath) ? fs.readJsonSync(tsconfigPath) : {}

  const pkgPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    console.error(chalk.red(`未找到: "${pkgPath}" 文件`))
    process.exit()
  }
  const pkg = fs.readJSONSync(pkgPath)
  return userConfig.formats.reduce((prev, type, index) => {
    const optionDev: TsrvOptions = {
      cwd,
      format: type,
      outDir: userConfig.outDir,
      env: 'development',
      pkg: pkg,
      tsconfig,
      declaration: userConfig.formats.length - index <= 1,
      output: {
        file: `${userConfig.outDir}/${safePackageName(pkg.name)}.${type}.development.js`,
        // Pass through the file format
        format: type,
        // Do not let Rollup call Object.freeze() on namespace import objects
        // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
        freeze: false,
        // Respect tsconfig esModuleInterop when setting __esModule.
        esModule: Boolean(tsconfig?.compilerOptions?.esModuleInterop),
        name: pkg.name || safeVariableName(pkg.name),
        sourcemap: true,
        globals: userConfig.globals,
        exports: 'named'
      }
    }

    const optionProd: TsrvOptions = {
      ...optionDev,
      env: 'production',
      declaration: false,
      output: { ...optionDev.output, file: `${userConfig.outDir}/${safePackageName(pkg.name)}.${type}.production.js` }
    }

    prev.push(optionDev, optionProd)
    return prev
  }, [] as TsrvOptions[])
}
