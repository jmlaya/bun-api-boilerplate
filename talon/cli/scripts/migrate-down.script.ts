import { initializeDatabase, getAbsolutePath, loadBaseConfig, log } from '@talon/core';

export async function migrateDown() {
  const config = await loadBaseConfig();
  const sql = await initializeDatabase(config.database);

  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const last = await sql`
    SELECT name FROM _migrations 
    ORDER BY executed_at DESC 
    LIMIT 1
  `.then((res) => res[0]?.name);

  if (!last) {
    log.INFO('No migrations to revert');
    await sql.end();
    return;
  }

  const migrationsPath = getAbsolutePath(config.paths!.migrations!);
  await Bun.$`mkdir -p ${migrationsPath}`;

  const content = await Bun.file(`${migrationsPath}/${last}`).text();
  const [, down] = content.split('-- down');

  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(down);
      await tx`DELETE FROM _migrations WHERE name = ${last}`;
    });

    log.INFO(`Reverted: ${last}`);
    await sql.end();
  } catch (error) {
    log.ERROR(`Error reverting ${last}:`, error);
    await sql.end();
    process.exit(1);
  }
}

if (import.meta.main) {
  await migrateDown();
}
