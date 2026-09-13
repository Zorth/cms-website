# Stripe Integration Guide

This application integrates with **Stripe** for handling community event signups, memberships, and payments.

---

## 1. Environment Variables

The following Stripe environment variables are configured in `.env.local` (and should be mirrored on Vercel):

```env
# Client-side publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side publishable & secret keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Webhook secret (for validating Stripe events)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 2. Payment & Membership Architecture

1. **Checkout**: When a user selects a membership plan or event ticket, a Stripe Checkout session or PaymentIntent is created server-side.
2. **Webhooks**: Stripe sends event notifications (e.g. `checkout.session.completed`, `customer.subscription.created`) to `/api/webhooks/stripe`.
3. **Convex Update**: On successful payment, the webhook handler updates the event signup status or calls Convex mutations to promote the user role to `"member"`.
4. **Clerk Entitlement Sync**: Convex triggers `syncClerkMembership`, propagating `isMember: true` into Clerk's public metadata so all sibling apps immediately recognize the membership.
