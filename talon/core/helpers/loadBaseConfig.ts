import { log } from '../log';
import { GeneralAppOptions } from '../types';
import { deepMerge } from './deepMerge';

export const defaultOptions: GeneralAppOptions = {
  general: {
    corsOrigins: ['*'],
  },
  paths: {
    services: 'app/services',
    migrations: 'database/migrations',
    seeds: 'database/seeds',
  },
};

function interpolateEnvValues(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{env\.([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name: string) => process.env[name] ?? '');
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateEnvValues(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, interpolateEnvValues(item)]));
  }

  return value;
}

export async function loadBaseConfig() {
  let config: GeneralAppOptions = {};
  const path = 'talon.json';

  if (await Bun.file(path).exists()) {
    try {
      config = interpolateEnvValues(JSON.parse(await Bun.file(path).text())) as GeneralAppOptions;
    } catch (error) {
      log.ERROR('Error loading talon.json:', error);
      process.exit(1);
    }

    return deepMerge(defaultOptions, config);
  }

  return defaultOptions;
}
