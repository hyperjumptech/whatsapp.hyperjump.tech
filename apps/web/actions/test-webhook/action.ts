"use server";

// This is the main entry point for the register action that you can use in the client component.
// The register action is wrapped with all the necessary contexts:
// - dbContext: The prisma client.
// - randomContext: The uuid function.
// - whatsappClient: The whatsapp client.

import { testWebhookActionCreator } from "./index";

// TEST#1
/**
 * This is a server function that can be called from the client component.
 *
 * @param data - Contains the type and token to test the webhook for.
 * @returns The error code if the data is invalid. On success, it redirects to the /test-webhook/success page.
 */
export const testWebhook = testWebhookActionCreator();
