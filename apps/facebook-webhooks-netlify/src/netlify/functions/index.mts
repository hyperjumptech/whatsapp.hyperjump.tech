import { Context, Config } from "@netlify/functions";
import { createApp } from "facebook-webhooks/app";

const app = createApp();

// Netlify function handler
export default async (req: Request, context: Context) => {
  return app.fetch(req, context);
};

export const config: Config = {
  path: ["/api/webhook/facebook", "/health"],
};
