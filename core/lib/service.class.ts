import { SQL } from 'bun';
import type { ServicesContainer } from './service-container.class';

export abstract class Service {
  constructor(protected sql: SQL, protected services: ServicesContainer) {}
}
