import path from 'path'
import camelCase from 'camelcase'

export const packageName = (name: string) =>
  camelCase(
    name
      .replace(/^@.*\//, '')
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
  )

export const external = (id: string) => !id.startsWith('.') && !path.isAbsolute(id)
