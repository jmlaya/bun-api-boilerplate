import { parseArgs } from 'util';
import { resolve } from 'node:path';
import { loadConfig } from '../core/helpers/loadConfig';

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
  console.error('❌ You must specify a name for the migration:');
  console.log('$ bun run scripts/create-migration.ts --name <migration_name>');
  process.exit(1);
}
const timestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, '')
  .slice(0, 14);

const safeName = name
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/[^a-z0-9_]/g, '');

const fileName = `${timestamp}_${safeName}.sql`;
const content = `-- up
-- Here the SQL code for the migration
-- CREATE TABLE... ALTER TABLE... etc

-- down
-- Here the SQL code to revert the migration
-- DROP TABLE... ALTER TABLE... etc
`;

const config = await loadConfig();
const migrationsPath = resolve(process.cwd(), config.database!.migrationsPath!);
await Bun.$`mkdir -p ${migrationsPath}`;

const filePath = `${migrationsPath}/${fileName}`;
await Bun.write(filePath, content);

console.log(`✅ Nueva migración creada en: ${filePath}`);
