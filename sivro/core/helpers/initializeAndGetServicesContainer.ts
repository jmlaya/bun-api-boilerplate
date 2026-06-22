import { SQL } from 'bun';
import { readdir } from 'node:fs/promises';
import { ServicesContainer } from '../lib/service-container.class';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { GeneralAppOptions } from '../types';

async function loadModules(files: string[], container: ServicesContainer, sql: SQL, options: GeneralAppOptions) {
  for (const path of files) {
    const modulo = await import(path);
    const serviceName = Object.keys(modulo)[0];
    const ServiceClass = modulo[serviceName];
    container.register(serviceName, (c) => new ServiceClass(sql, c));
  }
}

export async function initializeAndGetServicesContainer(servicesPath: string, sql: SQL, options: GeneralAppOptions) {
  const container = new ServicesContainer();

  container.register('AuthService', (c) => new AuthService(sql, c, options));
  container.register('UsersService', (c) => new UsersService(sql, c));

  const resolvedServicesPath = servicesPath;
  const files = (await readdir(resolvedServicesPath))
    .filter((file) => file.endsWith('.ts'))
    .map((file) => `${resolvedServicesPath}/${file}`);

  await loadModules(files, container, sql, options);

  return container;
}
