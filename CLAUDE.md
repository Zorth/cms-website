<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## User Roles & Authentication Rules

- **Valid Roles**: A user's role is strictly one of: `"user"` (default account), `"member"`, or `"dragon"`.
- **Dragon Status**: A user is a Dragon **if and only if** their role is explicitly set to `"dragon"` (in Convex `users.role === "dragon"`).
- **"admin" Metadata**: The Clerk/JWT metadata field `"admin"` is completely independent of being a dragon and **unrelated to this project**. **NEVER** check, infer, or modify `"admin"` when determining dragon status or admin permissions on this website.
- **"isMember" Entitlement**:
  - `isMember` is `true` if and only if the user is a `"member"` or a `"dragon"`.
  - `isMember` is `false` for standard `"user"` accounts.
  - This status syncs to Clerk `publicMetadata.isMember` for cross-site authorization (`tarragon.be` & `guild.tarragon.be`).

## Organization & Payments Rules

- **Organization**: Tarragon VZW (non-profit in Belgium).
- **VAT / BTW Compliance**: Payments are processed directly through Stripe (NOT through Clerk billing) to properly handle Belgian VAT (BTW) regulations.
- **"Kobold" Membership**: 10 EUR / year subscription.
- **Membership Activation**: Successful payment of the Kobold membership activates `"member"` status (`isMember = true`) in Convex and syncs to Clerk `publicMetadata.isMember`.

## Git Operations Rule

- **Do NOT commit or push** git changes unless the user explicitly tells you to do so.
