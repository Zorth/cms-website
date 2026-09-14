import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("dragon")
    ),
    isMember: v.boolean(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_isMember", ["isMember"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  signups: defineTable({
    eventSlug: v.string(),
    groupName: v.string(),
    name: v.string(),
    email: v.string(),
    cancelToken: v.string(),
    userId: v.optional(v.id("users")),
  })
    .index("by_event", ["eventSlug"])
    .index("by_event_group", ["eventSlug", "groupName"])
    .index("by_token", ["cancelToken"])
    .index("by_user", ["userId"]),
});
