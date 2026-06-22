import { SQL } from 'bun';
import { config } from '../app/config';
import { log } from './log';

export async function initializeDatabase() {
  try {
    const sql = new SQL(config.database);

    await sql.connect();

    log.INFO('Database initialized successfully');

    return sql;
  } catch (error) {
    log.ERROR('Failed to connect to the database:', error);
    process.exit(1);
  }
}
