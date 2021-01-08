import path from 'path'
import camelCase from 'camelcase'
import { default as createDebug } from 'debug'

export const cleanUrl = (url: string) => {
  const queryRE = /\?.*$/
  const hashRE = /#.*$/
  return url.replace(hashRE, '').replace(queryRE, '')
}

export const createDebugger = (namespace: string) => {
  return createDebug(namespace)
}

export function posToNumber(source: string, pos: number | { line: number; column: number }): number {
  const splitRE = /\r?\n/
  if (typeof pos === 'number') return pos
  const lines = source.split(splitRE)
  const { line, column } = pos
  let start = 0
  for (let i = 0; i < line - 1; i++) {
    start += lines[i].length
  }
  return start + column
}

export function generateCodeFrame(
  source: string,
  start: number | { line: number; column: number } = 0,
  end?: number
): string {
  const splitRE = /\r?\n/
  const range: number = 2
  start = posToNumber(source, start)
  end = end || start
  const lines = source.split(splitRE)
  let count = 0
  const res: string[] = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        const line = j + 1
        res.push(`${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`)
        const lineLength = lines[j].length
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1
          const length = Math.max(1, end > count ? lineLength - pad : end - start)
          res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length))
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1)
            res.push(`   |  ` + '^'.repeat(length))
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}

export const packageName = (name: string) =>
  camelCase(
    name
      .replace(/^@.*\//, '')
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
  )
export const packageFullName = (name: string) =>
  camelCase(
    name
      .replace(/\//, '-')
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
  )
export const external = (id: string) => !id.startsWith('.') && !path.isAbsolute(id)
