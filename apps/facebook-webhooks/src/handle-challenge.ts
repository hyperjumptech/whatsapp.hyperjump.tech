import { env } from "@workspace/env";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

const querySchema = z.object({
  "hub.mode": z.string(),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

export const handleChallenge = async (
  queries: Record<string, string>
): Promise<{ status: ContentfulStatusCode; message: string }> => {
  const parsedQueries = querySchema.safeParse(queries);
  if (!parsedQueries.success) {
    // TEST#1
    return {
      status: 400,
      message: "Invalid token",
    };
  }

  const hubMode = parsedQueries.data["hub.mode"];
  const hubVerifyToken = parsedQueries.data["hub.verify_token"];
  const hubChallenge = parsedQueries.data["hub.challenge"];

  if (
    hubMode === "subscribe" &&
    hubVerifyToken === env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
  ) {
    // TEST#2
    return {
      status: 200,
      message: hubChallenge,
    };
  }
  // TEST#3
  return {
    status: 400,
    message: "Invalid token",
  };
};
