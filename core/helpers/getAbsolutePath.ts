export function getAbsolutePath(relativePath: string): string {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${process.cwd()}${path}`;
}
