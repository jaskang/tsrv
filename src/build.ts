import defu from 'defu';
import type { ExternalOption, OutputOptions } from 'rollup';
import type { RollupAliasOptions } from '@rollup/plugin-alias';
import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import type { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import type { Options as RollupEsbuildOptions } from 'rollup-plugin-esbuild';
import { tryRequire } from './utils';
import { getRollupOptions, rollupBuild } from './builder';
import { relative, resolve } from 'pathe';
import fg from 'fast-glob';
import fs from 'fs-extra';
import consola from 'consola';
import chalk from 'chalk';
import { readPackageJSON } from 'pkg-types';

type BuildMode = 'miniapp-components' | 'vue-components' | 'lib';

interface CliBuildOptions {
  mode: BuildMode;
  watch: boolean;
  config: string;
}

export type BuildConfig = {
  mode: 'miniapp' | 'vue' | 'lib';
};
export type BuildOptions = {
  mode: BuildMode;
  target?: string;
  root: string;
  pkgDir: string;
  srcDir: string;
  distDir: string;
  input: string[];
  output?: OutputOptions;
  define: Record<string, string>;
  format: 'cjs' | 'esm';
  minify: boolean;
  sourcemap: boolean;
  external?: (string | RegExp)[];
  pluginOptions: {
    replace?: RollupReplaceOptions['values'];
    alias?: RollupAliasOptions;
    commonjs?: RollupCommonJSOptions;
    nodeResolve?: RollupNodeResolveOptions;
    esbuild?: RollupEsbuildOptions;
  };
  watch: boolean;
};

export async function build(cwd: string, args: Record<string, any>, target?: string) {
  const configPath = args.config || './wsbuild.config';

  const buildConfig: BuildConfig = tryRequire(configPath, cwd) || {};

  const pkgDir = target ? resolve(cwd, 'packages', target) : cwd;

  if (!(await fs.pathExists(pkgDir))) {
    throw Error(`路径不存在: ${relative(cwd, pkgDir)}`);
  }

  const pkg = await readPackageJSON(pkgDir);
  if (!target) {
    if (await fs.pathExists(resolve(pkgDir, 'packages'))) {
      throw Error(`当前为 monorepo 根仓库，需要使用 "wsbundler build [pkg]" 指定构建目标`);
    }
  }

  const options: BuildOptions = defu<BuildOptions, BuildOptions[]>(buildConfig, {
    mode: 'miniapp-components' as BuildMode,
    root: cwd,
    pkgDir: pkgDir,
    srcDir: 'src',
    format: 'cjs',
    distDir: 'dist',
    define: {},
    input: ['src/index.ts'],
    target: target || '',
    minify: true,
    sourcemap: false,
    pluginOptions: {},
    watch: false
  });

  if (options.mode === 'miniapp-components') {
    // monorepo 根目录运行时 需要组装路径
    const inputs = await fg(options.pkgDir ? `${options.pkgDir}/${options.srcDir}/**/*` : `${options.srcDir}/**/*`, {
      cwd: options.root
    });
    // console.log(options.pkgDir ? `${options.pkgDir}/${options.srcDir}/**/*` : `${options.srcDir}/**/*`, inputs);

    options.input = inputs;
  }
  consola.info(chalk.gray('构建目标: ') + chalk.green(pkg.name));
  consola.info(chalk.gray(`开始构建`));

  const distPath = resolve(options.root, options.pkgDir, options.distDir);
  await fs.remove(distPath);
  consola.success(chalk.gray(`清理构建目录: ${relative(options.root, distPath)}`));
  const rollupOptions = await rollupBuild(options);
  consola.info(chalk.gray(`构建完成`));
}
