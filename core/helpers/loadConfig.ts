export async function loadConfig() {
  let config: { database?: { migrationsPath?: string } } = {};

  try {
    config = JSON.parse(await Bun.file('sivro.json').text());

    if (!config.database?.migrationsPath) {
      throw new Error('Migrations path not defined in sivro.json');
    }
  } catch (error) {
    console.error('Error loading sivro.json:', error);
    process.exit(1);
  }
  return config;
}
