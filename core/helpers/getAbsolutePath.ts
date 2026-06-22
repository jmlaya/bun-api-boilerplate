import { resolve } from 'node:path';

export function getAbsolutePath(relativePath: string): string {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return resolve(process.cwd(), path);
}
