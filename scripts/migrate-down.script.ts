import { initializeDatabase, sql } from '../core/database';
import { log } from '../core/log';

async function migrateDown() {
  await initializeDatabase();

  const last = await sql`
    SELECT name FROM _migrations 
    ORDER BY executed_at DESC 
    LIMIT 1
  `.then((res) => res[0]?.name);

  if (!last) {
    log.INFO('No migrations to revert');
    return;
  }

  const content = await Bun.file(`database/migrations/${last}`).text();
  const [, down] = content.split('-- down');

  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(down);
      await tx`DELETE FROM _migrations WHERE name = ${last}`;
    });

    log.INFO(`⏪ Reverted: ${last}`);
  } catch (error) {
    log.ERROR(`❌ Error reverting ${last}:`, error);
    process.exit(1);
  }

  await sql.end();
}

migrateDown();
