import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sql } from './database';
import { ServicesContainer } from './lib/service-container.class';

export async function initializeAndGetServicesContainer() {
  const container = new ServicesContainer();
  const servicesPath = resolve('app/services');
  const files = await readdir(servicesPath);

  for (const element of files) {
    const modulo = await import(`${servicesPath}/${element}`);
    const serviceName = Object.keys(modulo)[0];
    container.register(serviceName, (c) => new modulo[serviceName](sql, c));
  }

  return container;
}
