import { declare } from '@babel/helper-plugin-utils'

export interface BabelPresetTsrvOptions {
  format: string
}

const ENV = process.env.BABEL_ENV || process.env.NODE_ENV

export default declare((api, options) => {
  api.assertVersion(7)
  return {
    presets: [
      [
        require('@babel/preset-env'),
        {
          loose: true,
          targets: { browsers: ['last 2 versions', 'android >= 5'] },
          modules: ENV === 'test' ? 'auto' : false,
          exclude: ['transform-regenerator', 'transform-async-to-generator', 'proposal-object-rest-spread']
        }
      ]
      // [require('@babel/preset-typescript'), { allExtensions: true, isTSX: true, jsxPragma: 'preserve' }]
    ],
    plugins: [
      [require('@babel/plugin-transform-typescript'), { allExtensions: true, isTSX: true, jsxPragma: 'preserve' }],
      [require('@ant-design-vue/babel-plugin-jsx'), { transformOn: true }],
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-export-namespace-from'),
      [require('babel-plugin-transform-async-to-promises'), { inlineHelpers: true, externalHelpers: true }],
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      // 支持 类属性转换
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      // 支持 optional chaining (.?)
      require('@babel/plugin-proposal-optional-chaining'),
      // 支持 ?? operator
      require('@babel/plugin-proposal-nullish-coalescing-operator'),
      [require('@babel/plugin-transform-regenerator'), { async: false }],
      require('@babel/plugin-proposal-do-expressions'),
      [require('@babel/plugin-transform-runtime')]
    ]
  }
})
