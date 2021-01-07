import { rollup } from 'rollup'
import fs from 'fs-extra'
import dts from 'rollup-plugin-dts'
import { TsrvConfig } from '../../config'
import path from 'path'
import chalk from 'chalk'

export async function buildTypes({ root, distDir }: TsrvConfig) {
  const bundle = await rollup({
    input: `${distDir}/__temp__/index.d.ts`,
    external: [/\.(scss|sass|less|css)$/],
    plugins: [dts()]
  })
  await bundle.write({ file: `${distDir}/index.d.ts`, format: 'es' })
  await fs.remove(path.join(distDir, '__temp__'))
  console.log(
    `${chalk.gray(chalk.bold(path.basename(`${distDir}/index.d.ts`)))} ${chalk.green(
      `type file completed successfully.`
    )}`
  )
}
