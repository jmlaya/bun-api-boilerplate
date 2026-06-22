import { SQL } from 'bun';
import { GeneralAppOptions } from '../types';
import type { ServicesContainer } from './service-container.class';
import { Service } from './service.class';

export abstract class InternalService extends Service {
  constructor(
    protected sql: SQL,
    protected services: ServicesContainer,
    protected config: GeneralAppOptions,
  ) {
    super(sql, services);
  }
}
