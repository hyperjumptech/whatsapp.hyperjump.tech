"use server";

// This is the main entry point for the register action that you can use in the client component.
// The register action is wrapped with all the necessary production contexts:
// - dbContext: The prisma client.
// - randomContext: The uuid function.
// - whatsappClient: The whatsapp client.
// - timeContext: The time context.

import { registerActionCreator } from "./index";

// TEST#1
/**
 * This is a server function that can be called from the client component.
 *
 * @param data - Contains the name and phone to register.
 * @returns The error code if the data is invalid. On success, it redirects to the /confirm page.
 */
export const register = registerActionCreator();
