import { readdir } from 'node:fs/promises';
import { argv } from 'node:process';
import { initializeDatabase, getAbsolutePath, loadBaseConfig, log } from '@talon/core';

export async function dbSeed() {
  const config = await loadBaseConfig();
  const sql = await initializeDatabase(config.database);
  const seedToRun = argv[2];
  const seedsPath = getAbsolutePath(config.paths!.seeds!);
  let files = await readdir(seedsPath);

  files = !!seedToRun ? files.filter((f) => f.startsWith(seedToRun)) : files;

  await sql.connect();

  for (const file of files) {
    try {
      const modulo = await import(`${seedsPath}/${file}`);
      const seeder = await modulo.default(sql);

      log.INFO(`Seed executed: ${file}`);
    } catch (error) {
      log.ERROR(`Error in ${file}:`, error);
      await sql.end();
      process.exit(1);
    }
  }

  await sql.end();
}

if (import.meta.main) {
  await dbSeed();
}
