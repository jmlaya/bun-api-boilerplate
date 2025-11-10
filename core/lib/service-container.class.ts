import { config } from '../../app/config';
import { log } from '../log';
import type { Service } from './service.class';

export class ServicesContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T extends Service>(name: string, factory: (c: ServicesContainer) => T) {
    this.factories.set(name, () => factory(this));

    if (config.general.debug) {
      log.DEBUG(`Service registered: ${name}`);
    }
  }

  get<T extends Service>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) throw new Error(`Service ${name} not registered`);
      this.services.set(name, factory());
    }
    return this.services.get(name);
  }
}
