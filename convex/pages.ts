import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all pages, optionally filtered by language and enabled status.
 */
export const listPages = query({
  args: {
    language: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    if (args.language !== undefined && args.enabled !== undefined) {
      return await ctx.db
        .query("pages")
        .withIndex("by_language_and_enabled", (q) =>
          q.eq("language", args.language!).eq("enabled", args.enabled!)
        )
        .take(limit);
    }
    if (args.enabled !== undefined) {
      return await ctx.db
        .query("pages")
        .withIndex("by_enabled", (q) => q.eq("enabled", args.enabled!))
        .take(limit);
    }
    return await ctx.db.query("pages").take(limit);
  },
});

/**
 * Get single page by slug.
 */
export const getPageBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Save (create or update) a page.
 * Guarded: Dragon access required.
 */
export const savePage = mutation({
  args: {
    id: v.optional(v.id("pages")),
    slug: v.string(),
    title: v.string(),
    body: v.string(),
    language: v.string(),
    enabled: v.boolean(),
    hideFromHeader: v.optional(v.boolean()),
    weight: v.optional(v.number()),
    snippet: v.optional(v.string()),
    icon: v.optional(v.string()),
    iconName: v.optional(v.string()),
    translationSlug: v.optional(v.string()),
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

    const normalizedSlug = args.slug.trim().replace(/\.mdx$/, "");

    // Check slug uniqueness
    const existingWithSlug = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .unique();

    if (existingWithSlug && (!args.id || existingWithSlug._id !== args.id)) {
      throw new Error(`A page with slug "${normalizedSlug}" already exists.`);
    }

    const payload = {
      slug: normalizedSlug,
      title: args.title.trim(),
      body: args.body,
      language: args.language,
      enabled: args.enabled,
      hideFromHeader: args.hideFromHeader,
      weight: args.weight,
      snippet: args.snippet?.trim() || undefined,
      icon: args.icon?.trim() || undefined,
      iconName: args.iconName?.trim() || undefined,
      translationSlug: args.translationSlug?.trim() || undefined,
    };

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new Error("Page not found to update");
      }
      await ctx.db.patch(args.id, payload);
      return args.id;
    } else {
      return await ctx.db.insert("pages", payload);
    }
  },
});

/**
 * Delete a page by ID.
 * Guarded: Dragon access required.
 */
export const deletePage = mutation({
  args: { id: v.id("pages") },
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

    const page = await ctx.db.get(args.id);
    if (!page) {
      throw new Error("Page not found");
    }

    await ctx.db.delete(args.id);
    return { success: true, slug: page.slug };
  },
});

/**
 * Batch import/upsert pages.
 */
export const importPagesBatch = mutation({
  args: {
    pages: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        body: v.string(),
        language: v.string(),
        enabled: v.boolean(),
        hideFromHeader: v.optional(v.boolean()),
        weight: v.optional(v.number()),
        snippet: v.optional(v.string()),
        icon: v.optional(v.string()),
        iconName: v.optional(v.string()),
        translationSlug: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const item of args.pages) {
      const existing = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: item.title,
          body: item.body,
          language: item.language,
          enabled: item.enabled,
          hideFromHeader: item.hideFromHeader,
          weight: item.weight,
          snippet: item.snippet,
          icon: item.icon,
          iconName: item.iconName,
          translationSlug: item.translationSlug,
        });
        updated++;
      } else {
        await ctx.db.insert("pages", {
          slug: item.slug,
          title: item.title,
          body: item.body,
          language: item.language,
          enabled: item.enabled,
          hideFromHeader: item.hideFromHeader,
          weight: item.weight,
          snippet: item.snippet,
          icon: item.icon,
          iconName: item.iconName,
          translationSlug: item.translationSlug,
        });
        inserted++;
      }
    }

    return { inserted, updated, total: args.pages.length };
  },
});
