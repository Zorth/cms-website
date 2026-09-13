"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

/**
 * Server Action to update a user's role and isMember in Clerk metadata.
 * Only callable by users with the dragon role in Convex.
 */
export async function updateUserRoleAction(
  targetClerkId: string,
  newRole: "user" | "member" | "dragon"
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Please sign in");
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Server misconfiguration: NEXT_PUBLIC_CONVEX_URL not set");
  }

  // Verify dragon status in Convex (source of truth)
  const convex = new ConvexHttpClient(convexUrl);
  const caller = await convex.query(api.users.getUserByClerkId, {
    clerkId: userId,
  });

  const isDragon = caller?.role === "dragon";

  if (!isDragon) {
    throw new Error("Forbidden: Only Dragons can update user roles");
  }

  const isMember = newRole === "member" || newRole === "dragon";

  const client = clerkClient();
  await client.users.updateUserMetadata(targetClerkId, {
    publicMetadata: {
      role: newRole,
      isMember,
    },
  });

  return { success: true, role: newRole, isMember };
}
