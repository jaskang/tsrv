#!/usr/bin/env node
import { resolve } from 'pathe';
import mri from 'mri';
import { build } from './build';
import consola from 'consola';

async function main() {
  const { _, ...args } = mri(process.argv.splice(2));
  const cwd = resolve(process.cwd(), '.');

  const [command, target] = _;

  switch (command) {
    case 'build':
      await build(cwd, args, target);
      break;
    default:
      break;
  }
}

main().catch((error) => {
  consola.error(error.message);
  process.exit(1);
});
