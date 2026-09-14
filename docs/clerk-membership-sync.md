# Clerk Membership & Entitlement Sync Guide

This document outlines the standard pattern for sharing user membership status and entitlements between **`tarragon.be`** and **`guild.tarragon.be`** using a shared **Clerk** authentication instance and **Convex** backend.

---

## 1. Overview & Architecture

Since both `tarragon.be` and `guild.tarragon.be` share the same **Clerk** project (`clerk.tarragon.be`), Clerk acts as the central single source of truth for user identity and membership status.

### **The Flow:**
1. **Purchase / Update (`tarragon.be`)**: When a user purchases a subscription or updates their tier on `tarragon.be`, the backend updates `user.publicMetadata` in Clerk.
2. **JWT Injection (Clerk Template)**: Clerk injects `isMember` into the session JWT token issued to the user.
3. **Reactive Backend Access (`guild.tarragon.be`)**: Convex reads `identity.isMember` instantly from `ctx.auth.getUserIdentity()` with **0 latency** and **0 inter-server API calls**, and syncs it into the `users` database table upon user sync.

---

## 2. Clerk JWT Template Configuration

In **[Clerk Dashboard](https://dashboard.clerk.com)** $\rightarrow$ **JWT Templates** $\rightarrow$ **Convex**:

Ensure `"isMember"` is included in the JSON Claims:

```json
{
  "aud": "convex",
  "name": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "picture": "{{user.image_url}}",
  "nickname": "{{user.username}}",
  "admin": "{{user.public_metadata.admin}}",
  "gamemaster": "{{user.public_metadata.gamemaster}}",
  "isMember": "{{user.public_metadata.isMember}}",
  "extraSessionsRan": "{{user.public_metadata.extraSessionsRan}}",
  "extraSessionsPlayed": "{{user.public_metadata.extraSessionsPlayed}}"
}
```

---

## 3. Setting Membership Metadata on `tarragon.be`

When a user's membership changes on `tarragon.be` (e.g. after a payment or subscription webhook):

```ts
import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// Set membership status in Clerk publicMetadata
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    isMember: true, // or false / tier string e.g. "gold"
  },
})
```

---

## 4. Reading Membership Status in `guild.tarragon.be` (Convex)

### **A. In Convex Server Functions (`convex/`):**

```ts
import { query } from './_generated/server'
import { extractClaim } from './roles'

export const getMemberContent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    // Check directly from JWT claims (Instant, in-memory)
    const memberClaim = extractClaim(identity, 'isMember')
    const isMember = memberClaim === true || String(memberClaim).toLowerCase() === 'true'

    if (!isMember) {
      throw new Error('Access denied: Active membership required.')
    }

    return { success: true }
  },
})
```

### **B. Database Sync (`convex/users.ts`):**

The `syncUser` mutation automatically extracts `isMember` from `identity` and updates the user record in the `users` table:

```ts
// convex/schema.ts
users: defineTable({
  userId: v.string(),
  isMember: v.optional(v.boolean()),
  // ...
})
```

---

## 5. Benefits of this Pattern

* **Zero Latency**: Eliminates the need for HTTP API calls or Convex-to-Convex network requests between `tarragon.be` and `guild.tarragon.be`.
* **Automatic Refresh**: `ConvexProviderWithAuth` handles background token refreshes; when Clerk metadata updates, the new token with updated claims is propagated automatically.
* **Single Source of Truth**: User access rights remain tied directly to their authentication identity.
