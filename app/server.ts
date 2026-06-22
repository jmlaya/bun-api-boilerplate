import { sivro } from '../core/sivro';
import { config } from './config';

const { app, router } = await sivro({ database: config.database });

export type AppType = typeof router;
export default app;
