import babel from '@babel/core'
import jsx from '@vue/babel-plugin-jsx'
import { Plugin } from 'rollup'
import { createDebugger } from '../../../utils'

const debug = createDebugger('vuedoc:esbuild')

const vueJsxPlugin = (options = {}): Plugin => {
  let needSourceMap = true

  return {
    name: 'vuedoc:jsxPlugin',
    transform(code, id) {
      if (/\.[jt]sx$/.test(id)) {
        const plugins = [[jsx, options]]
        if (id.endsWith('.tsx')) {
          plugins.push([require('@babel/plugin-transform-typescript'), { isTSX: true, allowExtensions: true }])
        }

        const result = babel.transformSync(code, {
          ast: true,
          plugins,
          sourceMaps: needSourceMap,
          sourceFileName: id
        })

        return {
          code: result.code,
          map: result.map
        }
      }
    }
  }
}

export default vueJsxPlugin
