import { env } from "@workspace/env";

export const isDebugEnabled = () => {
  return env.DEBUG?.includes("facebook-webhooks");
};
