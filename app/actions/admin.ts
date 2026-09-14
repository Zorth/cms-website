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
  newRole: "user" | "member" | "dragon",
  membershipExpiresAt?: number
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
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  const expiresAt =
    newRole === "member"
      ? (membershipExpiresAt !== undefined ? membershipExpiresAt : Date.now() + oneYearMs)
      : null;

  const client = await clerkClient();
  await client.users.updateUserMetadata(targetClerkId, {
    publicMetadata: {
      role: newRole,
      isMember,
      membershipExpiresAt: expiresAt,
    },
  });

  return { success: true, role: newRole, isMember, membershipExpiresAt: expiresAt };
}

/**
 * Server Action to update arbitrary publicMetadata keys on a Clerk user.
 * Specifically used for "voidmaster" (clerk metadata "gamemaster")
 * and "Void Manager" (clerk metadata "admin").
 * Only callable by users with the dragon role in Convex.
 */
export async function updateUserMetadataAction(
  targetClerkId: string,
  metadataUpdates: Record<string, any>
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
    throw new Error("Forbidden: Only Dragons can update user metadata");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(targetClerkId, {
    publicMetadata: metadataUpdates,
  });

  return { success: true, metadataUpdates };
}
