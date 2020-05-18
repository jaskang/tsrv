declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const comp: ComponentOptions
  export default comp
}
declare module '*.module.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}
