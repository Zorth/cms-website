import { mutation, query, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Store or update the authenticated user in the users table.
 * Automatically called upon login/auth sync.
 */
export const storeUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    // Check if user already exists by tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    const clerkId = identity.subject;
    const name = args.name ?? identity.name ?? undefined;
    const email = args.email ?? identity.email ?? undefined;
    const imageUrl = args.imageUrl ?? identity.pictureUrl ?? undefined;

    const customClaims = identity as Record<string, unknown>;
    const isAdmin =
      customClaims.admin === "true" || customClaims.admin === true;
    const hasClerkMemberClaim =
      customClaims.isMember === "true" || customClaims.isMember === true;

    if (user !== null) {
      // User exists - update profile details if changed, but preserve their assigned Convex role
      const isMember = user.role === "member" || user.role === "dragon";
      const patchData: {
        name?: string;
        email?: string;
        imageUrl?: string;
        clerkId?: string;
        isMember?: boolean;
      } = {};

      if (name && name !== user.name) patchData.name = name;
      if (email && email !== user.email) patchData.email = email;
      if (imageUrl && imageUrl !== user.imageUrl) patchData.imageUrl = imageUrl;
      if (clerkId && clerkId !== user.clerkId) patchData.clerkId = clerkId;
      if (user.isMember !== isMember) patchData.isMember = isMember;

      if (Object.keys(patchData).length > 0) {
        await ctx.db.patch(user._id, patchData);
      }
      return user._id;
    }

    // New user default role is strictly "user" (or "member" if flagged in Clerk)
    const initialRole: "user" | "member" | "dragon" = hasClerkMemberClaim
      ? "member"
      : "user";
    const isMember = initialRole === "member";

    // Insert new user with default role
    const newUserId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkId,
      name,
      email,
      imageUrl,
      role: initialRole,
      isMember,
    });

    return newUserId;
  },
});

/**
 * Get the currently authenticated user document.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

/**
 * Get a user document by their Clerk ID.
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Update a user's role ("user" | "member" | "dragon").
 * If the role is "member" or "dragon", isMember is set to true.
 * Automatically synchronizes isMember to Clerk publicMetadata via background action.
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("dragon")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isMember = args.role === "member" || args.role === "dragon";

    await ctx.db.patch(args.userId, {
      role: args.role,
      isMember,
    });

    // Schedule background task to sync isMember and role into Clerk's publicMetadata
    await ctx.scheduler.runAfter(0, internal.users.syncClerkMembership, {
      clerkId: user.clerkId,
      isMember,
      role: args.role,
    });

    return { success: true, role: args.role, isMember };
  },
});

/**
 * Update a user's role by their Clerk ID.
 * Upserts the user in Convex if they haven't logged in yet.
 */
export const updateUserRoleByClerkId = mutation({
  args: {
    clerkId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("dragon")
    ),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isMember = args.role === "member" || args.role === "dragon";

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        role: args.role,
        isMember,
      });
    } else {
      const issuer =
        process.env.CLERK_FRONTEND_API_URL?.replace(/^https?:\/\//, "") ||
        "clerk";
      await ctx.db.insert("users", {
        tokenIdentifier: `https://${issuer}|${args.clerkId}`,
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        role: args.role,
        isMember,
      });
    }

    // Schedule background task to sync isMember and role into Clerk's publicMetadata
    await ctx.scheduler.runAfter(0, internal.users.syncClerkMembership, {
      clerkId: args.clerkId,
      isMember,
      role: args.role,
    });

    return { success: true, role: args.role, isMember };
  },
});

/**
 * Internal action to synchronize isMember status into Clerk's user publicMetadata.
 * This ensures that subsequent JWTs generated by Clerk carry isMember: true/false.
 */
export const syncClerkMembership = internalAction({
  args: {
    clerkId: v.string(),
    isMember: v.boolean(),
    role: v.optional(
      v.union(v.literal("user"), v.literal("member"), v.literal("dragon"))
    ),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn(
        "CLERK_SECRET_KEY not set in Convex environment; skipping Clerk metadata sync"
      );
      return;
    }

    try {
      const public_metadata: Record<string, unknown> = {
        isMember: args.isMember,
      };
      if (args.role) {
        public_metadata.role = args.role;
      }

      const res = await fetch(
        `https://api.clerk.com/v1/users/${args.clerkId}/metadata`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_metadata,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `Failed to update Clerk publicMetadata for ${args.clerkId}:`,
          errorText
        );
      }
    } catch (err) {
      console.error(
        `Error calling Clerk API for user ${args.clerkId}:`,
        err
      );
    }
  },
});

/**
 * List users, optionally filtered by role or membership status.
 */
export const listUsers = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("user"),
        v.literal("member"),
        v.literal("dragon")
      )
    ),
    isMember: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.role) {
      const role = args.role;
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", role))
        .take(50);
    }
    if (args.isMember !== undefined) {
      const isMember = args.isMember;
      return await ctx.db
        .query("users")
        .withIndex("by_isMember", (q) => q.eq("isMember", isMember))
        .take(50);
    }
    return await ctx.db.query("users").take(50);
  },
});
