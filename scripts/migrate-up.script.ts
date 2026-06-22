import { initializeDatabase, sql } from '../core/database';
import { loadConfig } from '../core/helpers/loadConfig';
import { log } from '../core/log';
import { resolve } from 'node:path';

export async function migrateUp() {
  const config = await loadConfig();
  await initializeDatabase();

  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const glob = new Bun.Glob('*.sql');
  const migrationsPath = resolve(process.cwd(), config.database!.migrationsPath!);
  await Bun.$`mkdir -p ${migrationsPath}`;

  const executed = await sql<{ name: string }[]>`
    SELECT name FROM _migrations
  `.then((res) => new Set(res.map((row) => row.name)));
  const migrations: string[] = [];

  for await (const file of glob.scan({ cwd: migrationsPath })) {
    const fileName = file.split('/').pop()!;
    if (!executed.has(fileName)) {
      migrations.push(fileName);
    }
  }

  const pending = migrations.sort();

  console.log('Pending migrations:', pending);

  for (const migration of pending) {
    const filePath = `${migrationsPath}/${migration}`;
    const content = await Bun.file(filePath).text();
    const [up] = content.split('-- down');

    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(up.replace('-- up', ''));
        await tx`INSERT INTO _migrations ${tx({ name: migration })}`;
      });

      log.INFO(`✅ Applied: ${migration}`);
    } catch (error) {
      log.ERROR(`❌ Error in ${migration}:`, error);
      process.exit(1);
    }
  }
}

if (import.meta.main) {
  await migrateUp();
  await sql.end();
}
