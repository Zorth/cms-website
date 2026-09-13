# Roles & Permissions Architecture

This document describes the role hierarchy, security model, and authorization logic used across the Tarragon CMS and community platform.

---

## 1. Valid Roles

Every authenticated user in Convex has a role strictly defined as one of the following:

| Role | Description | Access Rights |
| :--- | :--- | :--- |
| `"user"` | Default account | Standard public access, profile viewing, standard content. |
| `"member"` | Verified member | Member-only content, priority event signups, community benefits. `isMember: true`. |
| `"dragon"` | Council / Administrator | Full administrative dashboard access (`/dragon`), role management, CMS & member management. `isMember: true`. |

---

## 2. Decoupling from Clerk `"admin"` Metadata

> [!IMPORTANT]
> **Strict Security Isolation**:
> The Clerk / JWT public metadata field `"admin"` is completely independent of being a Dragon and **unrelated to this project**.
>
> - External legacy apps or tools may write `admin: true` into Clerk metadata.
> - **NEVER** check, infer, or modify `"admin"` when determining Dragon status or admin permissions on this website.
> - A user is a Dragon **if and only if** their Convex role is explicitly set to `"dragon"` (`users.role === "dragon"`).

---

## 3. The `isMember` Entitlement Flag

The `isMember` boolean in Convex (`v.boolean()`) represents active membership entitlement:
- `isMember = true` if and only if role is `"member"` or `"dragon"`.
- `isMember = false` for standard `"user"` accounts.

When a role is updated in the `/dragon` admin dashboard or via Convex mutations, the system automatically:
1. Calculates `isMember = (newRole === "member" || newRole === "dragon")`.
2. Updates the `users` table record in Convex.
3. Asynchronously triggers a Clerk Backend API call to update `user.publicMetadata.isMember`.
4. Enables zero-latency cross-domain entitlement checking across `tarragon.be` and `guild.tarragon.be`.

---

## 4. Protected Routes & Interfaces

- **Header Admin Button**:
  Only rendered if `currentUser?.role === "dragon"`.
- **`/dragon` Dashboard**:
  Guarded on the client and server. Non-dragons or unauthenticated users are shown an access denied warning and blocked from fetching administrative user lists or mutating roles.
- **Server Actions & API Routes**:
  Server actions in `app/actions/admin.ts` verify the caller's identity and confirm `caller.publicMetadata?.role === "dragon"` before executing Clerk user management queries or mutations.
