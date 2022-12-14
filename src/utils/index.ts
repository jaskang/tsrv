import jiti from 'jiti'
import fs from 'fs-extra'
import consola from 'consola'
import { relative, resolve } from 'pathe'
import { options } from 'less'

export function tryRequire<T extends Record<string, any> = Record<string, any>>(
  id: string,
  roots: string[]
): { config: T; configFile: string } | null {
  let index = 0
  let ret = null
  while (index < roots.length && !ret) {
    ret = jitiRequire(id, roots[index])
    if (!ret) {
      index++
    }
  }
  return ret ? { config: ret, configFile: resolve(roots[index], id) } : null
}
export function jitiRequire(id: string, root: string) {
  const _require = jiti(root, { interopDefault: true, esmResolve: true, sourceMaps: true })
  try {
    return _require(id)
  } catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      consola.error(`Error trying import ${id} from ${root}`, error)
    } else {
      // consola.warn(error)
    }
    return null
  }
}
