"use server";

import { clerkClient } from "@clerk/nextjs/server";

/**
 * Server action to update a user's isMember status directly in Clerk publicMetadata.
 * If role is 'member' or 'dragon', isMember is true, otherwise false.
 */
export async function updateClerkMembership(
  clerkUserId: string,
  role: "user" | "member" | "dragon"
) {
  const isMember = role === "member" || role === "dragon";
  const client = await clerkClient();

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      isMember,
    },
  });

  return { success: true, isMember };
}
