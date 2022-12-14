import path from 'node:path'
import less from 'less'
import sass from 'sass'
import fs from 'fs-extra'

export async function buildLess(input: string, output: string, options: any = {}) {
  const result = await less.render(await fs.readFile(input, { encoding: 'utf8' }), {
    strictImports: true,
    javascriptEnabled: true,
    filename: input,
    ...options,
  })
  await fs.outputFile(output, result.css)
}

export async function buildSass(input: string, output: string) {
  const result = sass.compile(input)
  await fs.outputFile(output, result.css)
}
