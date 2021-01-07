import path from 'path'
import chalk from 'chalk'
import { Service, Message, Loader, TransformOptions, TransformResult, startService } from 'esbuild'
import { cleanUrl, createDebugger, generateCodeFrame } from '../../../utils'
import { Plugin, SourceMap } from 'rollup'
import { createFilter } from '@rollup/pluginutils'

const debug = createDebugger('vuedoc:esbuild')

// lazy start the service
let _servicePromise: Promise<Service> | undefined

export interface ESBuildOptions extends TransformOptions {
  include?: string | RegExp | string[] | RegExp[]
  exclude?: string | RegExp | string[] | RegExp[]
  jsxInject?: string
}

export async function ensureService() {
  if (!_servicePromise) {
    _servicePromise = startService()
  }
  return _servicePromise!
}

export async function stopService() {
  if (_servicePromise) {
    const service = await _servicePromise
    service.stop()
    _servicePromise = undefined
  }
}

export type EsbuildTransformResult = Omit<TransformResult, 'map'> & {
  map: SourceMap
}

export async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: TransformOptions
): Promise<EsbuildTransformResult> {
  const service = await ensureService()
  // if the id ends with a valid ext, use it (e.g. vue blocks)
  // otherwise, cleanup the query before checking the ext
  const ext = path.extname(/\.\w+$/.test(filename) ? filename : cleanUrl(filename))
  const resolvedOptions = {
    loader: ext.slice(1) as Loader,
    sourcemap: true,
    // ensure source file name contains full query
    sourcefile: filename,
    ...options
  } as ESBuildOptions

  try {
    const result = await service.transform(code, resolvedOptions)
    return {
      ...result,
      map: JSON.parse(result.map)
    }
  } catch (e) {
    debug(`esbuild error with options used: `, resolvedOptions)
    // patch error information
    if (e.errors) {
      e.frame = ''
      e.errors.forEach((m: Message) => {
        e.frame += `\n` + prettifyMessage(m, code)
      })
      e.loc = e.errors[0].location
    }
    throw e
  }
}

export const esbuildPlugin = (options: any = {}): Plugin => {
  const filter = createFilter(/\.ts$/, /\.js$/)

  return {
    name: 'vuedoc:esbuildPlugin',
    async transform(code, id) {
      if (filter(id) || filter(cleanUrl(id))) {
        const result = await transformWithEsbuild(code, id, options)
        if (result.warnings.length) {
          result.warnings.forEach(m => {
            this.warn(prettifyMessage(m, code))
          })
        }
        return {
          code: result.code,
          map: result.map
        }
      }
    },
    // async renderChunk(code, chunk) {
    //   const target = options.target
    //   return transformWithEsbuild(code, chunk.fileName, {
    //     target: target || undefined,
    //     minify: true
    //   })
    // },
    async buildEnd() {
      await stopService()
    }
  }
}

function prettifyMessage(m: Message, code: string): string {
  let res = chalk.yellow(m.text)
  if (m.location) {
    const lines = code.split(/\r?\n/g)
    const line = Number(m.location.line)
    const column = Number(m.location.column)
    const offset =
      lines
        .slice(0, line - 1)
        .map(l => l.length)
        .reduce((total, l) => total + l + 1, 0) + column
    res += `\n` + generateCodeFrame(code, offset, offset + 1)
  }
  return res + `\n`
}
