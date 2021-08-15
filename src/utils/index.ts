import * as path from 'path';
import * as fs from 'fs';

export const isRunningInRoot = (): boolean => {
  const packageJsonPath = path.resolve('package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  return true;
};
