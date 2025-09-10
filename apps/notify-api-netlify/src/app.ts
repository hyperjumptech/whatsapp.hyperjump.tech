import { env } from "@workspace/env";
import { createApp as createNotifyApiApp } from "notify-api/app";
import { createApp as createFacebookWebhooksApp } from "facebook-webhooks/app";
import { Config } from "@netlify/functions";

export const app = () => {
  if (env.NETLIFY_APP_NAME === "facebook-webhooks") {
    return createFacebookWebhooksApp();
  }
  return createNotifyApiApp();
};

export const path = (): Config["path"] => {
  if (env.NETLIFY_APP_NAME === "facebook-webhooks") {
    return ["/api/webhook/facebook", "/health"];
  }
  return ["/api/notify", "/health"];
};
