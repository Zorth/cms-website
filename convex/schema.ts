import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  signups: defineTable({
    eventSlug: v.string(),
    groupName: v.string(),
    name: v.string(),
    email: v.string(),
    cancelToken: v.string(),
  }).index("by_event", ["eventSlug"])
    .index("by_event_group", ["eventSlug", "groupName"])
    .index("by_token", ["cancelToken"]),
});
