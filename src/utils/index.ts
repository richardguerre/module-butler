import * as path from 'path';
import * as fs from 'fs';

// TODO: remove as its not needed for this CLI. It was needed in relay-butler.
export const isRunningInRoot = (): boolean => {
  const packageJsonPath = path.resolve('package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  return true;
};
