import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

// WhatsApp message schema validation
const WhatsAppMessageSchema = z.object({
  messaging_product: z.literal("whatsapp"),
  to: z.string(),
  type: z.literal("template"),
  template: z.object({
    name: z.string(),
    language: z.object({
      code: z.string(),
    }),
    components: z.array(
      z.object({
        type: z.literal("body"),
        parameters: z.array(
          z.object({
            type: z.literal("text"),
            text: z.string(),
          })
        ),
      })
    ),
  }),
});

app.get("/", (c) => {
  return c.json({
    message: "WhatsApp Mock Server",
    version: "1.0.0",
    endpoints: {
      "POST /:phoneId/messages": "Send WhatsApp message",
    },
  });
});

app.post("/:phoneId/messages", async (c) => {
  try {
    const phoneId = c.req.param("phoneId");
    const authHeader = c.req.header("Authorization");

    // Check if Authorization header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          error: {
            message: "Invalid or missing authorization token",
            type: "OAuthException",
            code: 190,
            error_subcode: 460,
            fbtrace_id: "mock-fbtrace-id",
          },
        },
        401
      );
    }

    // Validate request body
    const body = await c.req.json();
    const validationResult = WhatsAppMessageSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          error: {
            message: "Invalid request format",
            type: "OAuthException",
            code: 100,
            error_subcode: 33,
            fbtrace_id: "mock-fbtrace-id",
          },
        },
        400
      );
    }

    const { to, template } = validationResult.data;

    // Generate a mock message ID
    const messageId = `mock-message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create success response
    const response = {
      messaging_product: "whatsapp",
      contacts: [
        {
          input: to,
          wa_id: to,
        },
      ],
      messages: [
        {
          id: messageId,
        },
      ],
    };

    console.log(`[MOCK SERVER] Message sent successfully:`, {
      phoneId,
      to,
      template: template.name,
      messageId,
      timestamp: new Date().toISOString(),
    });

    return c.json(response, 200);
  } catch (error) {
    console.error("[MOCK SERVER] Error processing request:", error);

    return c.json(
      {
        error: {
          message: "Internal server error",
          type: "OAuthException",
          code: 1,
          error_subcode: 1,
          fbtrace_id: "mock-fbtrace-id",
        },
      },
      500
    );
  }
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler for unmatched routes
app.notFound((c) => {
  return c.json(
    {
      error: {
        message: "Endpoint not found",
        type: "OAuthException",
        code: 100,
        error_subcode: 33,
        fbtrace_id: "mock-fbtrace-id",
      },
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error("[MOCK SERVER] Unhandled error:", err);

  return c.json(
    {
      error: {
        message: "Internal server error",
        type: "OAuthException",
        code: 1,
        error_subcode: 1,
        fbtrace_id: "mock-fbtrace-id",
      },
    },
    500
  );
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5003;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `🚀 WhatsApp Mock Server is running on http://localhost:${info.port}`
    );
    console.log(
      `📱 Mock endpoint: POST http://localhost:${info.port}/:phoneId/messages`
    );
    console.log(`🏥 Health check: GET http://localhost:${info.port}/health`);
  }
);
