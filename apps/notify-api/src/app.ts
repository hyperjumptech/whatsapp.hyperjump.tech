import { Context, Hono } from "hono";
import { notify } from "./notify.js";
import {
  dbContextStorage,
  defaultDbContext,
} from "@workspace/database/context";
import { logger } from "hono/logger";
import { isDebugEnabled } from "./utils/debug.js";
import {
  ContextBuilder,
  withMultipleContextFunction,
} from "@workspace/utils/multiple-contexts";
import {
  whatsappClientStorage,
  defaultWhatsappClientContext,
} from "@workspace/whatsapp/client-context";

export const createApp = (options: { isNetlify?: boolean } = {}) => {
  const app = new Hono();

  if (isDebugEnabled()) {
    app.use(logger());
  }

  app.get("/", (c) => {
    return c.json({
      message: "Monika Whatsapp Notify API Server",
      version: "1.0.0",
      deployed: options.isNetlify ? "Netlify Functions" : undefined,
    });
  });

  app.post(
    "/api/notify",
    withMultipleContextFunction(
      new ContextBuilder()
        .addContext(dbContextStorage, defaultDbContext)
        .addContext(whatsappClientStorage, defaultWhatsappClientContext),
      async (c: Context) => {
        const query = c.req.query();
        let body = null;
        try {
          body = await c.req.json();
        } catch (error) {
          console.error("Error parsing body", error);
        }

        const { error, message, status } = await notify({ query, body });

        return c.json({ error, message, status }, status);
      }
    )
  );

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      deployed: options.isNetlify ? "Netlify Functions" : undefined,
      uptime: options.isNetlify ? undefined : process.uptime(),
    });
  });

  // 404 handler for unmatched routes
  app.notFound((c) => {
    return c.json(
      {
        error: {
          message: "Endpoint not found",
        },
      },
      404
    );
  });

  // Global error handler
  app.onError((err, c) => {
    const prefix = options.isNetlify ? "[NOTIFY API]" : "[MOCK SERVER]";
    console.error(`${prefix} Unhandled error:`, err);

    return c.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      500
    );
  });

  return app;
};
