import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all dragons.
 */
export const listDragons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dragons").collect();
  },
});

/**
 * Save (create or update) a dragon card.
 * Guarded: Caller must be authenticated and have role === "dragon".
 */
export const saveDragon = mutation({
  args: {
    id: v.optional(v.id("dragons")),
    name: v.string(),
    title: v.optional(v.string()),
    image: v.optional(v.string()),
    body: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user.role !== "dragon") {
      throw new Error("Unauthorized: Dragon access required");
    }

    const payload = {
      name: args.name.trim(),
      title: args.title?.trim() || undefined,
      image: args.image?.trim() || undefined,
      body: args.body?.trim() || undefined,
      order: args.order,
    };

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new Error("Dragon not found to update");
      }
      await ctx.db.patch(args.id, payload);
      return args.id;
    } else {
      return await ctx.db.insert("dragons", payload);
    }
  },
});

/**
 * Delete a dragon by ID.
 * Guarded: Caller must be authenticated and have role === "dragon".
 */
export const deleteDragon = mutation({
  args: { id: v.id("dragons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user.role !== "dragon") {
      throw new Error("Unauthorized: Dragon access required");
    }

    const dragon = await ctx.db.get(args.id);
    if (!dragon) {
      throw new Error("Dragon not found");
    }

    await ctx.db.delete(args.id);
    return { success: true, name: dragon.name };
  },
});

/**
 * Batch import/upsert dragons (used during migration).
 */
export const importDragonsBatch = mutation({
  args: {
    dragons: v.array(
      v.object({
        name: v.string(),
        title: v.optional(v.string()),
        image: v.optional(v.string()),
        body: v.optional(v.string()),
        order: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const item of args.dragons) {
      const existing = await ctx.db
        .query("dragons")
        .withIndex("by_name", (q) => q.eq("name", item.name))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: item.title,
          image: item.image,
          body: item.body,
          order: item.order,
        });
        updated++;
      } else {
        await ctx.db.insert("dragons", {
          name: item.name,
          title: item.title,
          image: item.image,
          body: item.body,
          order: item.order,
        });
        inserted++;
      }
    }

    return { inserted, updated, total: args.dragons.length };
  },
});
