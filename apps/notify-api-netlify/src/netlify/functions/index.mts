import { Context, Config } from "@netlify/functions";
import { createApp } from "notify-api/app";

const app = createApp({ isNetlify: true });

// Netlify function handler
export default async (req: Request, context: Context) => {
  return app.fetch(req, context);
};

export const config: Config = {
  path: ["/api/notify", "/health"],
};
