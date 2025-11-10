import { SQL } from 'bun';
import { config } from '../app/config';
import { log } from './log';

export const sql = new SQL(config.database);
let connected = false;

export async function initializeDatabase() {
  try {
    if (connected) return;

    await sql.connect();
    connected = true;

    log.INFO('Database initialized successfully');
  } catch (error) {
    log.ERROR('Failed to connect to the database:', error);
    process.exit(1);
  }
}
