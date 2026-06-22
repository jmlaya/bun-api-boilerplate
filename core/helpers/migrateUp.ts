import { sql } from '../database';

let config: { database?: { migrationsPath?: string } } = {};

try {
  config = JSON.parse(await Bun.file('gazelle.json').text());
} catch (error) {
  console.error('Error loading gazelle.json:', error);
}

async function migrateUp() {
  // Crear tabla de control
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Obtener migraciones ejecutadas
  const executed = await sql`
    SELECT name FROM _migrations
  `.then((res) => new Set(res.map((row) => row.name)));

  // Configurar el sistema de glob
  const glob = new Bun.Glob('*.sql');
  const migrationsPath = new URL(config.database?.migrationsPath || './migrations', import.meta.url).pathname;

  // Buscar archivos usando la API correcta
  const migrations: string[] = [];
  for await (const file of glob.scan({ cwd: migrationsPath })) {
    const fileName = file.split('/').pop()!;
    if (!executed.has(fileName)) {
      migrations.push(fileName);
    }
  }

  // Ejecutar en orden alfabético
  const pending = migrations.sort();

  // Procesar migraciones
  for (const migration of pending) {
    const filePath = `${migrationsPath}/${migration}`;
    const content = await Bun.file(filePath).text();
    const [up] = content.split('-- down');

    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(up.replace('-- up', ''));
        await tx`INSERT INTO _migrations ${tx({ name: migration })}`;
      });
      console.log(`✅ Aplicada: ${migration}`);
    } catch (error) {
      console.error(`❌ Error en ${migration}:`, error);
      process.exit(1);
    }
  }

  await sql.end();
}

migrateUp();
