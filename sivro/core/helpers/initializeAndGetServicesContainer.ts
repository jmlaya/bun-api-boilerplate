import { SQL } from 'bun';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ServicesContainer } from '../lib/service-container.class';

export async function initializeAndGetServicesContainer(servicesPath: string, sql: SQL) {
  const container = new ServicesContainer();
  const resolvedServicesPath = resolve(servicesPath);
  const files = await readdir(resolvedServicesPath);

  for (const element of files) {
    const modulo = await import(`${resolvedServicesPath}/${element}`);
    const serviceName = Object.keys(modulo)[0];
    container.register(serviceName, (c) => new modulo[serviceName](sql, c));
  }

  return container;
}
