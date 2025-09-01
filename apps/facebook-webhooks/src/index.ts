import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import {
  getDbContext,
  withDbContextFunction,
} from "@workspace/database/context";
import { webhookFacebook } from "./webhook-facebook.js";
import { logger } from "hono/logger";
import { isDebugEnabled } from "./utils/debug.js";
import { handleChallenge } from "./handle-challenge.js";

const app = new Hono();

if (isDebugEnabled()) {
  // TEST#6
  app.use(logger());
}

app.get("/", (c) => {
  // TEST#1
  return c.json({
    message: "Facebook Webhooks Server",
    version: "1.0.0",
  });
});

app.get("/api/webhook/facebook", async (c) => {
  const queries = c.req.query();
  const { status, message } = await handleChallenge(queries);

  // TEST#2
  return c.text(message, status);
});

// This is copied from the old code.
app.post(
  "/api/webhook/facebook",
  withDbContextFunction(async (c: Context) => {
    const headers = c.req.raw.headers;
    const body = await c.req.json();

    const { error, status } = await webhookFacebook({
      headers,
      body,
    });

    // TEST#3
    return c.json(error ? { error } : null, status);
  })
);

// Health check endpoint
app.get(
  "/health",
  withDbContextFunction(async (c) => {
    const { prisma } = getDbContext();
    const webhookLogs = await prisma.webhook_logs.count();
    // TEST#4
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      webhookLogs,
    });
  })
);

// 404 handler for unmatched routes
app.notFound((c) => {
  // TEST#5
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
  // TEST#7
  console.error("[MOCK SERVER] Unhandled error:", err);

  return c.json(
    {
      error: {
        message: "Internal server error",
      },
    },
    500
  );
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5002;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `🚀 Facebook Webhooks Server is running on http://localhost:${info.port}`
    );
    console.log(`🏥 Health check: GET http://localhost:${info.port}/health`);
  }
);

export default app;
