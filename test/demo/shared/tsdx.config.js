const commonjs = require('@rollup/plugin-commonjs')
const nodeResolve = require('@rollup/plugin-node-resolve')
const images = require('@rollup/plugin-image')
const postcss = require('rollup-plugin-postcss')
const autoprefixer = require('autoprefixer')
const pkg = require('./package.json')

const external = Object.keys(pkg.peerDependencies || {})
const externalPredicate = new RegExp(`^(${external.join('|')})($|/)`)
const externalTest = external.length === 0 ? id => false : id => externalPredicate.test(id)

const globals = external.reduce((prevGlobals, name) => {
  if (name.match(/^[a-z_$][a-z0-9_$]*$/)) {
    prevGlobals[name] = name
  }
  return prevGlobals
}, {})

module.exports = {
  rollup(config, options) {
    const nodeResolveIndex = config.plugins.findIndex(plugin => {
      return typeof plugin === 'object' && plugin.name === 'node-resolve'
    })
    config.plugins.splice(
      nodeResolveIndex,
      1,
      nodeResolve({
        mainFields: ['module', 'jsnext', 'main'],
        browser: true,
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: true
      })
    )
    const commonjsIndex = config.plugins.findIndex(plugin => {
      return typeof plugin === 'object' && plugin.name === 'commonjs'
    })
    if (commonjsIndex >= 0) {
      config.plugins.splice(
        commonjsIndex,
        1,
        commonjs({
          include: /\/node_modules\//
        })
      )
    } else {
      config.plugins.splice(
        nodeResolveIndex + 1,
        0,
        commonjs({
          include: /\/node_modules\//
        })
      )
    }
    // config.output.globals = globals
    // console.log(globals)
    config.plugins = [
      ...config.plugins,
      images({ include: ['**/*.png', '**/*.jpg'] }),
      postcss({
        plugins: [autoprefixer()],
        inject: true,
        extract: !!options.writeMeta,
        autoModules: true,
        modules: {
          localsConvention: 'camelCase'
        }
      })
    ]
    config.external = id => {
      if (id === 'babel-plugin-transform-async-to-promises/helpers') {
        return false
      }
      return externalTest(id)
    }
    return config
  }
}
