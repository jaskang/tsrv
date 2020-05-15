import './syntax/nullish-coalescing'
import './syntax/optional-chaining'

import './syntax/jsx-import/JSX-import-JSX'

export { foo } from './foo'

async function testasync() {
  return await Promise.resolve(1)
}
export const sum = async (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('fuck')
  }
  const c = await testasync()
  return a + b + c
}
