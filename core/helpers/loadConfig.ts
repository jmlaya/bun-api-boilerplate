import { log } from '../log';
import { GeneralAppOptions } from '../types';
import { deepMerge } from './deepMerge';

export const defaultOptions: GeneralAppOptions = {
  general: {
    corsOrigins: ['*'],
  },
  paths: {
    services: '/app/services',
    migrations: '/database/migrations',
    seeds: '/database/seeds',
  },
};

export async function loadBaseConfig() {
  let config: GeneralAppOptions = {};
  const path = 'sivro.json';

  if (await Bun.file(path).exists()) {
    try {
      config = JSON.parse(await Bun.file(path).text());
    } catch (error) {
      log.ERROR('Error loading sivro.json:', error);
      process.exit(1);
    }

    return deepMerge(defaultOptions, config);
  }

  return defaultOptions;
}
