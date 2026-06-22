import { loadBaseConfig, initializeDatabase, log } from '@talon/core';
import { dbSeed } from './db-seed.script';
import { migrateUp } from './migrate-up.script';

async function dbReset() {
  const config = await loadBaseConfig();
  const sql = await initializeDatabase(config.database);
  const schema = config.database?.schema || 'public';

  log.INFO('Resetting database...');

  await sql.unsafe(`DROP SCHEMA ${schema} CASCADE;`).catch((error) => {
    log.WARN('Schema drop failed (it might not exist yet):', error.message);
  });

  await sql.unsafe(`CREATE SCHEMA ${schema};`).catch((error) => {
    log.WARN('Schema creation failed:', error);
  });

  await sql.end();
  await migrateUp();
  await dbSeed();
  log.INFO('Database reset complete.');
}

if (import.meta.main) {
  await dbReset();
}
