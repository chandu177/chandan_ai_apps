import { createApp, lakebase, server } from '@databricks/appkit';
import { setupEventsRoutes } from './routes/lakebase/events-routes';

createApp({
  plugins: [
    server({ autoStart: false }),
    lakebase(),
  ],
})
  .then(async (appkit) => {
    setupEventsRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
