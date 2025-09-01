"use server";

// This is the main entry point for the  deleteToken action that you can use in the client component.
// The deleteToken action is wrapped with all the necessary contexts:
// - dbContext: The prisma client.
// - randomContext: The uuid function.
// - whatsappClient: The whatsapp client.

import { deleteTokenActionCreator } from "./index";

// TEST#1
/**
 * This is a server function that can be called from the client component.
 *
 * @param data - Contains the token to delete.
 * @returns The error code if the token is not found or the user is not found. On success, it redirects to the /delete/success page.
 */
export const deleteToken = deleteTokenActionCreator();
