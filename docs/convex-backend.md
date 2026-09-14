# Convex Backend Guide

The backend for this project is built on [Convex](https://convex.dev), providing reactive database queries, transactional mutations, and scheduled background actions.

---

## 1. Schema & Data Model

Located in `convex/schema.ts`:

### `users` Table
- `tokenIdentifier`: Indexed string (`by_tokenIdentifier`) matching Clerk's JWT issuer token.
- `clerkId`: Clerk user ID (`user_...`), indexed by `by_clerkId`.
- `name`: Full display name of the user.
- `email`: Primary email address.
- `imageUrl`: Clerk avatar URL.
- `role`: Union of `"user" | "member" | "dragon"` (indexed by `by_role`).
- `isMember`: Non-optional boolean (`v.boolean()`, indexed by `by_isMember`).

### `signups` Table
- Event signups with attendee information, optional `userId` reference to `users`, and payment/ticket state.

---

## 2. Authentication Configuration

In `convex/auth.config.ts`:
Convex validates session tokens using Clerk's Frontend API URL:

```ts
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};
```

---

## 3. Key Convex Functions (`convex/users.ts`)

- **`storeUser` (Mutation)**:
  Runs automatically on client app mount (`app/UserSync.tsx`). Upserts the user record. Preserves any existing role assigned in Convex without reverting to `"user"`.
- **`getCurrentUser` (Query)**:
  Returns the database user record for the authenticated caller.
- **`listUsers` (Query)**:
  Protected query accessible only to users with `role === "dragon"`.
- **`updateUserRole` / `updateUserRoleByClerkId` (Mutation)**:
  Updates the user's role in the database, recalculates `isMember`, and schedules the `syncClerkMembership` background action.
- **`syncClerkMembership` (Internal Action)**:
  Communicates with Clerk REST API to update `publicMetadata.isMember` and `publicMetadata.role`.

---

## 4. Running Convex in Development

```bash
# Convex development sync
npx convex dev
```
