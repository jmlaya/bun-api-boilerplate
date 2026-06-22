import { SQL } from 'bun';
import { log } from './log';
import { GeneralAppOptions } from './types';

export async function initializeDatabase(options?: GeneralAppOptions['database']) {
  try {
    const sql = new SQL(options);

    await sql.connect();

    log.INFO('Database initialized successfully');

    return sql;
  } catch (error) {
    log.ERROR('Failed to connect to the database:', error);
    process.exit(1);
  }
}
