import { mutation, query, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getEventSignups = query({
  args: { eventSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signups")
      .withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
      .collect();
  },
});

export const signup = mutation({
  args: {
    eventSlug: v.string(),
    groupName: v.string(),
    name: v.string(),
    email: v.string(),
    maxSlots: v.number(),
    eventTitle: v.string(),
  },
  handler: async (ctx, args) => {
    // Check current signups for this group
    const existing = await ctx.db
      .query("signups")
      .withIndex("by_event_group", (q) =>
        q.eq("eventSlug", args.eventSlug).eq("groupName", args.groupName)
      )
      .collect();

    if (existing.length >= args.maxSlots) {
      throw new Error("This group is already full!");
    }

    // Check if email already signed up for this event
    const emailCheck = await ctx.db
      .query("signups")
      .withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (emailCheck) {
      throw new Error("You are already signed up for this event!");
    }

    const id = await ctx.db.insert("signups", {
      eventSlug: args.eventSlug,
      groupName: args.groupName,
      name: args.name,
      email: args.email,
    });

    await ctx.scheduler.runAfter(0, internal.signups.sendConfirmationEmail, {
      email: args.email,
      name: args.name,
      eventTitle: args.eventTitle,
      groupName: args.groupName,
    });

    return id;
  },
});

export const sendConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    eventTitle: v.string(),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const resend_api_key = process.env.RESEND_API_KEY;
    if (!resend_api_key) {
      console.error("RESEND_API_KEY not set");
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resend_api_key}`,
      },
      body: JSON.stringify({
        from: "Tarragon <noreply@tarragon.be>",
        to: [args.email],
        subject: `Registration Confirmed: ${args.eventTitle}`,
        html: `
          <h1>Hi ${args.name},</h1>
          <p>Your registration for <strong>${args.eventTitle}</strong> in the group <strong>${args.groupName}</strong> has been confirmed!</p>
          <p>We look forward to seeing you there.</p>
          <br/>
          <p>Best regards,</p>
          <p>The Tarragon Team</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
    }
  },
});
