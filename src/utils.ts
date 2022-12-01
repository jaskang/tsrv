import jiti from 'jiti';
import fs from 'fs-extra';

export function tryRequire(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true, esmResolve: true, sourceMaps: true });
  try {
    return _require(id);
  } catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error trying import ${id} from ${rootDir}`, error);
    }
    return {};
  }
}
