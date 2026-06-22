import { sivro } from '../core/sivro';

const { app, router } = await sivro();

export type AppType = typeof router;
export default app;
