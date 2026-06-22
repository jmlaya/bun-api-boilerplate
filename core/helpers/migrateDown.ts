import { sql } from '../database';

async function migrateDown() {
  // Obtener última migración
  const last = await sql`
    SELECT name FROM _migrations 
    ORDER BY executed_at DESC 
    LIMIT 1
  `.then((res) => res[0]?.name);

  if (!last) {
    console.log('No hay migraciones para revertir');
    return;
  }

  // Cargar archivo de migración
  const content = await Bun.file(`migrations/${last}`).text();
  const [, down] = content.split('-- down');

  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(down);
      await tx`DELETE FROM _migrations WHERE name = ${last}`;
    });
    console.log(`⏪ Revertida: ${last}`);
  } catch (error) {
    console.error(`❌ Error al revertir ${last}:`, error);
    process.exit(1);
  }

  await sql.end();
}

migrateDown();
