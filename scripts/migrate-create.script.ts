import { parseArgs } from 'util';

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

await Bun.$`mkdir -p migrations`;

const filePath = `database/migrations/${fileName}`;
await Bun.write(filePath, content);

console.log(`✅ Nueva migración creada en: ${filePath}`);
