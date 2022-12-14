export type PublishOptions = {
  mode: 'major' | 'minor' | 'patch'
  tag?: string
  root: string
  packageDir: string
}

export type PublishArgs = Partial<Omit<PublishOptions, 'packageDir'>>
