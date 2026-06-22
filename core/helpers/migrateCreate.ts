import { parseArgs } from 'util';

// Obtener nombre de migración desde argumentos
const {
  values: { name },
} = parseArgs({
  args: Bun.argv,
  options: {
    name: {
      type: 'string',
      short: 'n',
    },
  },
  allowPositionals: true,
});

if (!name) {
  console.error('❌ Debes especificar un nombre para la migración:');
  console.log('  bun run scripts/create-migration.ts --name <nombre_migración>');
  process.exit(1);
}

// Generar timestamp en formato YYYYMMDDHHMMSS
const timestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, '')
  .slice(0, 14);

// Sanitizar nombre del archivo
const safeName = name
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/[^a-z0-9_]/g, '');

// Nombre del archivo final
const fileName = `${timestamp}_${safeName}.sql`;

// Contenido base de la migración
const content = `-- up
-- Aquí tu código SQL para aplicar la migración
-- CREATE TABLE... ALTER TABLE... etc

-- down
-- Aquí el código SQL para revertir la migración
-- DROP TABLE... ALTER TABLE... etc
`;

// Crear directorio si no existe
await Bun.$`mkdir -p migrations`;

// Escribir archivo
const filePath = `migrations/${fileName}`;
await Bun.write(filePath, content);

console.log(`✅ Nueva migración creada en: ${filePath}`);
