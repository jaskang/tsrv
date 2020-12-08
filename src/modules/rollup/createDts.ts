import { rollup } from 'rollup'

import dts from 'rollup-plugin-dts'

export async function createDts(input: string, output: string) {
  const bundle = await rollup({
    input: input,
    plugins: [dts()]
  })
  await bundle.write({ file: output, format: 'es' })
}
