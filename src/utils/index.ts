import fs from 'fs-extra'
import path from 'path'
import camelCase from 'camelcase'

// Remove the package name scope if it exists
export const removeScope = (name: string) => name.replace(/^@.*\//, '')

// UMD-safe package name
export const safeVariableName = (name: string) =>
  camelCase(
    removeScope(name)
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
  )

export const safePackageName = (name: string) =>
  name.toLowerCase().replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')

export const external = (id: string) => !id.startsWith('.') && !path.isAbsolute(id)
