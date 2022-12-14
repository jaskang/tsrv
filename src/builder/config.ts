export type BuildMode = 'miniapp-components' | 'vue-components' | 'lib' | 'node'

export type BuildOptions = {
  /**
   * 编译模式 'miniapp-components'(小程序组件库)、 'vue-components'(vue3组件库)、 'lib'(lib库)、 'node'(node端)
   */
  mode: BuildMode
  /**
   * 命令行运行根目录 默认: process.cwd()
   */
  root: string
  /**
   * 项目根目录 (monorepo 时有用)
   */
  workspace: string
  /**
   * 子包文件夹 (monorepo 专用)
   */
  packageDir: string
  /**
   * 源码文件夹 默认: src
   */
  srcDir: string
  /**
   * 构建输出文件夹 默认: dist
   */
  distDir: string
  /**
   * 入口文件 默认: [src/index.ts]
   */
  input: string[]
  /**
   * 环境变量替换 默认: {}
   */
  define: Record<string, string>
  format: 'cjs' | 'esm'
  external: string[]
  minify: boolean
  sourcemap: boolean
  watch: boolean
  demo?: {
    /**
     * 项目的目录，即 project.config.json 所在的目录
     */
    projectDir: string
    /**
     * NPM 构建的目录，即 miniprogram_npm 所在的目录
     */
    npmDir?: string
  }
}

export type BuildArgs = Partial<Omit<BuildOptions, 'workspace'>> & {
  config?: string
}

export type BuildConfig = Partial<Omit<BuildOptions, 'root' | 'workspace' | 'packageDir'>>
