"use server";

// This is the main entry point for the register action that you can use in the client component.
// The register action is wrapped with all the necessary contexts:
// - dbContext: The prisma client.
// - randomContext: The uuid function.
// - whatsappClient: The whatsapp client.

import { resendActionCreator } from "./index";

// TEST#1
/**
 * This is a server function that can be called from the client component.
 *
 * @param data - Contains the name and phone to resend the confirmation message for.
 * @returns The error code if the data is invalid.
 */
export const resend = resendActionCreator();
