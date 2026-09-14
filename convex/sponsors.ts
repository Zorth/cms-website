import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all sponsors/deals.
 */
export const listSponsors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db.query("sponsors").withIndex("by_order").take(limit);
  },
});

/**
 * Save (create or update) a sponsor deal.
 * Guarded: Dragon access required.
 */
export const saveSponsor = mutation({
  args: {
    id: v.optional(v.id("sponsors")),
    name: v.string(),
    link: v.string(),
    snippet: v.string(),
    body: v.optional(v.string()),
    image: v.optional(v.string()),
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
      link: args.link.trim(),
      snippet: args.snippet.trim(),
      body: args.body?.trim() || undefined,
      image: args.image?.trim() || undefined,
      order: args.order,
    };

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new Error("Sponsor not found to update");
      }
      await ctx.db.patch(args.id, payload);
      return args.id;
    } else {
      return await ctx.db.insert("sponsors", payload);
    }
  },
});

/**
 * Delete a sponsor deal by ID.
 * Guarded: Dragon access required.
 */
export const deleteSponsor = mutation({
  args: { id: v.id("sponsors") },
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

    const sponsor = await ctx.db.get(args.id);
    if (!sponsor) {
      throw new Error("Sponsor not found");
    }

    await ctx.db.delete(args.id);
    return { success: true, name: sponsor.name };
  },
});

/**
 * Batch import/upsert sponsors.
 */
export const importSponsorsBatch = mutation({
  args: {
    sponsors: v.array(
      v.object({
        name: v.string(),
        link: v.string(),
        snippet: v.string(),
        body: v.optional(v.string()),
        image: v.optional(v.string()),
        order: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const item of args.sponsors) {
      const existing = await ctx.db
        .query("sponsors")
        .withIndex("by_name", (q) => q.eq("name", item.name))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          link: item.link,
          snippet: item.snippet,
          body: item.body,
          image: item.image,
          order: item.order,
        });
        updated++;
      } else {
        await ctx.db.insert("sponsors", {
          name: item.name,
          link: item.link,
          snippet: item.snippet,
          body: item.body,
          image: item.image,
          order: item.order,
        });
        inserted++;
      }
    }

    return { inserted, updated, total: args.sponsors.length };
  },
});
