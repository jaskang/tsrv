import * as semver from 'semver'

export function bump(currentVersion: string, type?: 'major' | 'minor' | 'patch', tag?: string) {
  let _type: semver.ReleaseType = 'patch'
  if (tag) {
    _type = type ? `pre${type}` : 'prerelease'
  } else {
    _type = type || 'patch'
  }
  return semver.inc(currentVersion, _type, tag)
}
