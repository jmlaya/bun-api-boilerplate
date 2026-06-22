import { talon } from '@talon/core';
import { config } from './config';
import { initializeRouter } from './router';

const { app, router } = await talon({
  database: config.database,
  general: {
    corsOrigins: Array.isArray(config.general.corsOrigins) ? config.general.corsOrigins : [config.general.corsOrigins],
    debug: config.general.debug,
    isProduction: config.general.isProduction,
  },
  router: initializeRouter,
});

export type AppType = typeof router;
export default app;
