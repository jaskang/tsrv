import { execa } from 'execa'

export async function gitCommitTag({
  cwd,
  message,
  files,
}: {
  cwd: string
  message: string
  files?: string[]
}) {
  await execa('git', ['add', ...(files || ['.'])], { cwd })
  await execa('git', ['commit', '-a', '-m', message], { cwd })
}
export async function gitTag({ cwd, message, tag }: { cwd: string; message: string; tag: string }) {
  await execa('git', ['tag', '--annotate', '--message', message, tag], { cwd })
}

export async function gitPush(cwd: string) {
  await execa('git', ['push'], { cwd })
  await execa('git', ['push', '--tags'], { cwd })
}
