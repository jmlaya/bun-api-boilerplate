import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { argv } from 'node:process';
import { sql } from '../core/database';
import { log } from '../core/log';

export async function dbSeed() {
  const seedToRun = argv[2];
  const seedsPath = resolve('database/seeds');
  let files = await readdir(seedsPath);

  files = !!seedToRun ? files.filter((f) => f.startsWith(seedToRun)) : files;

  await sql.connect();

  for (const file of files) {
    try {
      const modulo = await import(`${seedsPath}/${file}`);
      const seeder = await modulo.default(sql);

      log.INFO(`✅ Seed executed: ${file}`);
    } catch (error) {
      log.ERROR(`❌ Error in ${file}:`, error);
      process.exit(1);
    }
  }
}

if (import.meta.main) {
  await dbSeed();
  await sql.end();
}
