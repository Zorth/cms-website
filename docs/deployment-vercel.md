# Vercel Deployment Guide

This project is deployed to **Vercel** with Next.js 14 App Router, TinaCMS, Convex backend, and Clerk authentication.

---

## 1. Prerequisites & Environment Variables

Ensure all required environment variables are added to the Vercel Project Settings under **Environment Variables**:

### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Frontend API publishable key.
- `CLERK_SECRET_KEY`: Clerk backend secret key.
- `CLERK_FRONTEND_API_URL`: Clerk Frontend API URL (e.g. `https://clerk.tarragon.be` or `https://...clerk.accounts.dev`).

### Convex Backend
- `NEXT_PUBLIC_CONVEX_URL`: Public URL of your production Convex deployment (e.g. `https://...convex.cloud`).
- `CONVEX_DEPLOYMENT`: Production deployment identifier (e.g. `prod:...`).

### Stripe Payments
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key.
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (server alias).
- `STRIPE_SECRET_KEY`: Stripe restricted or secret key.
- `STRIPE_WEBHOOK_SECRET`: Secret for validating Stripe webhooks.

### Tina CMS
- `NEXT_PUBLIC_TINA_CLIENT_ID`: Tina Cloud client ID.
- `TINA_TOKEN`: Tina Cloud content read-only token.
- `NEXT_PUBLIC_TINA_BRANCH`: Target branch for Tina content (e.g. `main`).

---

## 2. Build Configuration

In Vercel Project Settings:
- **Framework Preset**: `Next.js`
- **Build Command**: `pnpm build` (executes `tinacms build && next build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

---

## 3. Remote Image Domains

Avatar images from Clerk require the hostname `img.clerk.com` to be allowed in Next.js image optimization. This is configured in `next.config.js`:

```js
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "img.clerk.com",
    },
    // ...
  ],
}
```

---

## 4. Deploying via CLI

With the installed `deploy-to-vercel` or `vercel-cli-with-tokens` agent skills:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```
