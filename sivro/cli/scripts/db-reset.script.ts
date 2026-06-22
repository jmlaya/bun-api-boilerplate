import { config } from '../app/config';
import { initializeDatabase, sql } from '../core/database';
import { log } from '../core/log';
import { dbSeed } from './db-seed.script';
import { migrateUp } from './migrate-up.script';

async function dbReset() {
  log.INFO('Resetting database...');
  await initializeDatabase();

  await sql.unsafe(`DROP SCHEMA ${config.database.schema} CASCADE;`).catch((error) => {
    log.WARN('Schema drop failed (it might not exist yet):', error.message);
  });

  await sql.unsafe(`CREATE SCHEMA ${config.database.schema};`).catch((error) => {
    log.WARN('Schema creation failed:', error);
  });

  await migrateUp();
  await dbSeed();
  log.INFO('Database reset complete.');
}

if (import.meta.main) {
  await dbReset();
  await sql.end();
}
