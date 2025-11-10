import { bootstrap } from '../core/bootstrap';

const { app, router } = await bootstrap();

export type AppType = typeof router;
export default app;
