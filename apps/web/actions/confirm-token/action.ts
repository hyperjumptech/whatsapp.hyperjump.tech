"use server";

// This is the entry point for the confirmToken action that you can use in the client component.
// The confirmToken action is wrapped with all the necessary contexts:
// - dbContext: The prisma client.
// - randomContext: The uuid function.
// - whatsappClient: The whatsapp client.

import { confirmTokenActionCreator } from "./index";

// TEST#1
/**
 * This is a server function that can be called from the client component.
 *
 * @param data - Contains the token to confirm.
 * @returns The error code if the token is not found or the user is not found. On success, it redirects to the /confirmed page.
 */
export const confirmToken = confirmTokenActionCreator();
