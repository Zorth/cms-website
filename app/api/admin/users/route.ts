import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: NEXT_PUBLIC_CONVEX_URL not set" },
      { status: 500 }
    );
  }

  // Verify dragon status against Convex (source of truth for dragon role)
  const convex = new ConvexHttpClient(convexUrl);
  const caller = await convex.query(api.users.getUserByClerkId, {
    clerkId: userId,
  });

  const isDragon = caller?.role === "dragon";

  if (!isDragon) {
    return NextResponse.json(
      { error: "Forbidden: Dragon role required" },
      { status: 403 }
    );
  }

  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: 200,
      orderBy: "-created_at",
    });

    // Also fetch Convex users to ensure displayed roles reflect the Convex source of truth
    const convexUsers = await convex.query(api.users.listUsers, {});
    const convexRoleMap = new Map(
      convexUsers.map((u) => [
        u.clerkId,
        {
          role: u.role,
          isMember: u.isMember,
          membershipExpiresAt: u.membershipExpiresAt,
          stripeSubscriptionId: u.stripeSubscriptionId,
        },
      ])
    );

    const rawUsers = (response as any).data || response;
    const users = (rawUsers as any[]).map((u) => {
      const convexRecord = convexRoleMap.get(u.id);
      const role =
        convexRecord?.role ||
        (u.publicMetadata?.role as string) ||
        (u.publicMetadata?.isMember ? "member" : "user");

      const isMember =
        convexRecord !== undefined
          ? convexRecord.isMember
          : role === "member" ||
            role === "dragon" ||
            Boolean(u.publicMetadata?.isMember);

      const isVoidmaster = Boolean(
        u.publicMetadata?.gamemaster === true ||
        u.publicMetadata?.gamemaster === "true"
      );

      const isVoidManager = Boolean(
        u.publicMetadata?.admin === true ||
        u.publicMetadata?.admin === "true"
      );

      const membershipExpiresAt =
        convexRecord?.membershipExpiresAt ??
        (u.publicMetadata?.membershipExpiresAt as number | undefined);

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName:
          u.fullName ||
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          u.username ||
          "Unnamed User",
        email: u.emailAddresses?.[0]?.emailAddress || "No email",
        imageUrl: u.imageUrl,
        username: u.username,
        role: role as "user" | "member" | "dragon",
        isMember,
        membershipExpiresAt,
        hasStripeSubscription: Boolean(convexRecord?.stripeSubscriptionId),
        voidmaster: isVoidmaster,
        voidManager: isVoidManager,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching Clerk users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
