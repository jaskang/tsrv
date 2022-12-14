import { resolve, extname, relative, join } from 'pathe'
import { readPackageJSON, type PackageJson } from 'pkg-types'
import chalk from 'chalk'
import byteSize from 'byte-size'
import consola from 'consola'
import fastGlob from 'fast-glob'
import fs from 'fs-extra'
import mri from 'mri'
import defu from 'defu'
import chokidar from 'chokidar'
import type { BuildArgs, BuildConfig, BuildMode, BuildOptions } from './config'
import { buildLess, buildSass } from './css'
import { buildJS } from './esbuild'
import { tryRequire } from '../utils'

export async function buildMiniapp(options: BuildOptions, pkg: PackageJson) {
  const packagePath = resolve(options.root, options.packageDir)
  const srcPath = resolve(packagePath, options.srcDir)
  const distPath = resolve(packagePath, options.distDir)

  const jsEntries = options.input.filter(i => i.endsWith('.ts') || i.endsWith('.js'))
  const otherEntries = options.input.filter(i => !i.endsWith('.ts') && !i.endsWith('.js'))

  const result = await buildJS(jsEntries, options)
  if (result.errors.length > 0) {
    consola.info(result.errors[0].text)
  }
  const outputs = result.metafile?.outputs || {}

  for (const key of Object.keys(outputs)) {
    if (extname(key) !== '.map') {
      consola.success(
        `${chalk.green('[CJS]')} ${chalk.gray(join(options.packageDir, key))} ${chalk.blue(
          byteSize(outputs[key].bytes)
        )}`
      )
    }
  }

  for (const i of otherEntries) {
    const input = resolve(packagePath, i)
    const ext = extname(input)
    if (['.less', '.scss'].includes(ext)) {
      const fileName = relative(srcPath, input.replace(/\.(less|scss)/, '.wxss'))
      const output = resolve(distPath, fileName)
      if (ext === '.less') {
        await buildLess(input, output)
      } else {
        await buildSass(input, output)
      }
      const stat = await fs.stat(output)
      consola.success(
        `${chalk.green('[CSS]')} ${chalk.gray(relative(options.root, output))} ${chalk.blue(
          byteSize(stat.size)
        )}`
      )
    } else {
      const fileName = relative(srcPath, input)
      const output = resolve(distPath, fileName)
      await fs.copy(input, output)
      const stat = await fs.stat(output)
      consola.success(
        `${chalk.green('[CPY]')} ${chalk.gray(relative(options.root, output))} ${chalk.blue(
          byteSize(stat.size)
        )}`
      )
    }
  }

  if (options.demo) {
    const npmPath = resolve(
      options.workspace,
      options.demo.projectDir,
      options.demo.npmDir || 'miniprogram_npm'
    )
    const target = resolve(npmPath, pkg.name || '')
    await fs.copy(distPath, target)
    consola.success(
      `${chalk.green('[DEMO:NPM]')} ${chalk.gray(relative(options.workspace, target))}`
    )
  }
}

export async function build(cwd: string, argv: string[]) {
  const { _: commands, ...args } = mri<BuildArgs>(argv, {
    boolean: ['minify', 'sourcemap', 'watch'],
  })
  const [, target] = commands
  const root = args.root ? resolve(cwd, args.root) : cwd
  const workspace = (await fs.pathExists(resolve(root, '../../package.json')))
    ? resolve(root, '../../')
    : root

  const packageDir = target ? `packages/${target}` : ''

  const { config, configFile } =
    tryRequire<BuildConfig>(
      args.config || './kunkka.config',
      workspace !== root ? [root, workspace] : [root]
    ) || {}

  const options: BuildOptions = defu<BuildOptions, BuildArgs[]>(
    { root, workspace, packageDir },
    args,
    config || {},
    {
      mode: '' as BuildMode,
      srcDir: 'src',
      distDir: 'dist',
      input: ['src/index.ts'],
      define: {},
      format: 'cjs',
      external: [],
      minify: false,
      sourcemap: false,
      watch: false,
    }
  )
  if (!options.mode) {
    throw Error(`缺少参数 'mode', 请使用 --mode=[mode] 或者 config -> mode 指定`)
  }
  const packagePath = resolve(root, options.packageDir)
  if (!(await fs.pathExists(packagePath))) {
    throw Error(`找不到: ${options.packageDir}`)
  }
  if (!options.packageDir) {
    if (await fs.pathExists(resolve(root, 'pnpm-workspace.yaml'))) {
      throw Error(`当前为 monorepo 仓库根目录，你需要使用 "kunkka build [pkg]" 指定构建目录`)
    }
  }

  const pkg = await readPackageJSON(packagePath)
  if (options.mode === 'miniapp-components') {
    const inputs = await fastGlob(`${options.srcDir}/**/*`, {
      cwd: packagePath,
    })
    options.input = inputs
  }

  consola.log('')
  consola.info(chalk.gray('构建目标: ') + chalk.green(pkg.name))
  consola.info(chalk.gray('配置文件: ') + chalk.gray(config ? relative(root, configFile!) : '无'))
  consola.info(chalk.gray('模式: ') + chalk.gray(options.mode))
  consola.log('')
  const distPath = resolve(options.root, options.packageDir, options.distDir)
  // await fs.remove(distPath)
  consola.success(chalk.gray(`清理目录: ${relative(options.root, distPath)}`))
  await buildMiniapp(options, pkg)

  if (!options.watch) {
    consola.success(chalk.gray(`构建完成`))
    return
  }

  return new Promise((_, reject) => {
    const watcher = chokidar.watch([resolve(packagePath, options.srcDir)], {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored: ['**/{.git,node_modules,dist}/**'],
    })
    watcher
      .on('all', async () => {
        consola.info(chalk.gray(`重新构建`))
        await buildMiniapp(options, pkg)
      })
      .on('error', err => {
        reject(err)
      })
  })
}
