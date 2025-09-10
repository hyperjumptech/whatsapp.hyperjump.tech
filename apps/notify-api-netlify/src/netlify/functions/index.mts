import { Context, Config } from "@netlify/functions";
import { app, path } from "../../app.js";

// Netlify function handler
export default async (req: Request, context: Context) => {
  return app().fetch(req, context);
};

export const config: Config = {
  path: path(),
};
