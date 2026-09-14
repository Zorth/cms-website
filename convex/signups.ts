import { mutation, query, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getEventSignups = query({
  args: { eventSlug: v.string() },
  handler: async (ctx, args) => {
    const rawSignups = await ctx.db
      .query("signups")
      .withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
      .collect();

    const identity = await ctx.auth.getUserIdentity();
    let currentUser: any = null;
    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();
    }

    const isDragon = currentUser?.role === "dragon";

    return rawSignups.map((s) => {
      const isOwner =
        (currentUser?._id && s.userId === currentUser._id) ||
        (identity?.email && s.email.toLowerCase() === identity.email.toLowerCase());

      if (isDragon) {
        // Dragon account sees full info
        return {
          _id: s._id,
          _creationTime: s._creationTime,
          eventSlug: s.eventSlug,
          groupName: s.groupName,
          name: s.name,
          email: s.email,
          userId: s.userId,
          cancelToken: isOwner ? s.cancelToken : undefined,
          isDragonVisible: true,
        };
      }

      if (isOwner) {
        // Owner sees their own full details and cancel token
        return {
          _id: s._id,
          _creationTime: s._creationTime,
          eventSlug: s.eventSlug,
          groupName: s.groupName,
          name: s.name,
          email: s.email,
          userId: s.userId,
          cancelToken: s.cancelToken,
        };
      }

      // Other members / public see only first name, no email, no cancel token
      const firstName = s.name.trim().split(/\s+/)[0] || s.name;
      return {
        _id: s._id,
        _creationTime: s._creationTime,
        eventSlug: s.eventSlug,
        groupName: s.groupName,
        name: firstName,
        userId: s.userId,
      };
    });
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
    // Check if user is logged in via Clerk/Convex auth
    const identity = await ctx.auth.getUserIdentity();
    let convexUserId: any = undefined;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();
      if (user) {
        convexUserId = user._id;
      }
    }

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

    // Check if user/email already signed up for this event
    const eventSignups = await ctx.db
      .query("signups")
      .withIndex("by_event", (q) => q.eq("eventSlug", args.eventSlug))
      .collect();

    const alreadySignedUp = eventSignups.some((s) => {
      if (convexUserId && s.userId === convexUserId) return true;
      return s.email.toLowerCase() === args.email.toLowerCase();
    });

    if (alreadySignedUp) {
      throw new Error("You are already registered for this event!");
    }

    // Generate a secure unique cancellation token
    const cancelToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const id = await ctx.db.insert("signups", {
      eventSlug: args.eventSlug,
      groupName: args.groupName,
      name: args.name,
      email: args.email,
      cancelToken,
      userId: convexUserId,
    });

    await ctx.scheduler.runAfter(0, internal.signups.sendConfirmationEmail, {
      email: args.email,
      name: args.name,
      eventTitle: args.eventTitle,
      groupName: args.groupName,
      cancelToken,
    });

    return id;
  },
});

export const cancelSignup = mutation({
  args: { cancelToken: v.string() },
  handler: async (ctx, args) => {
    const signup = await ctx.db
      .query("signups")
      .withIndex("by_token", (q) => q.eq("cancelToken", args.cancelToken))
      .unique();

    if (!signup) {
      throw new Error("Invalid or expired cancellation link.");
    }

    await ctx.db.delete(signup._id);
    return { success: true, eventTitle: signup.eventSlug, name: signup.name };
  },
});

export const cancelMySignup = mutation({
  args: { signupId: v.id("signups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to cancel your registration.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User account not found.");
    }

    const signup = await ctx.db.get(args.signupId);
    if (!signup) {
      throw new Error("Registration not found.");
    }

    // Allow user to cancel if they own the signup, or if they are a dragon
    const isOwner = signup.userId === user._id || (user.email && signup.email.toLowerCase() === user.email.toLowerCase());
    const isDragon = user.role === "dragon";

    if (!isOwner && !isDragon) {
      throw new Error("You do not have permission to cancel this registration.");
    }

    await ctx.db.delete(signup._id);
    return { success: true };
  },
});

export const sendConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    eventTitle: v.string(),
    groupName: v.string(),
    cancelToken: v.string(),
  },
  handler: async (ctx, args) => {
    const resend_api_key = process.env.RESEND_API_KEY;
    if (!resend_api_key) {
      console.error("RESEND_API_KEY not set");
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tarragon.be";
    const cancelUrl = `${siteUrl}/event/cancel?token=${args.cancelToken}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resend_api_key}`,
      },
      body: JSON.stringify({
        from: "Tarragon <noreply@tarragon.be>",
        reply_to: "contact@tarragon.be",
        to: [args.email],
        subject: `Registration Confirmed: ${args.eventTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #942822;">Hi ${args.name},</h1>
            <p>Your registration for <strong>${args.eventTitle}</strong> in the group <strong>${args.groupName}</strong> has been confirmed!</p>
            <p>We look forward to seeing you there.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
              <p>Can't make it? No problem. You can cancel your registration by clicking the link below:</p>
              <a href="${cancelUrl}" style="color: #942822; font-weight: bold;">Cancel my registration</a>
              <p style="font-size: 0.8em; margin-top: 10px;">If the link doesn't work, copy and paste this URL into your browser:<br/> ${cancelUrl}</p>
            </div>
            
            <div style="margin-top: 30px; font-size: 0.8em; color: #888;">
              <p><strong>Tarragon VZW</strong><br/>
              Het Textielhuis<br/>
              Rijselsestraat 19, 8500 Kortrijk</p>
            </div>
            
            <br/>
            <p>Best regards,</p>
            <p><strong>The Tarragon Team</strong></p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
    }
  },
});
