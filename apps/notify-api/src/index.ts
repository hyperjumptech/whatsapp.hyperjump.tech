import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const app = createApp();

const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `🚀 Monika Notify API Server is running on http://localhost:${info.port}`
    );
    console.log(`🏥 Health check: GET http://localhost:${info.port}/health`);
  }
);

export default app;
