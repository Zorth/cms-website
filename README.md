# Tarragon CMS & Community Platform

The official web platform and Content Management System for [Tarragon](https://tarragon.be). Built with Next.js 14 App Router, TinaCMS, Convex reactive backend, Clerk authentication, and Stripe payments, deployed on Vercel.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **CMS**: [TinaCMS](https://tina.io/) (Git-backed content management with visual editing)
- **Database & Backend**: [Convex](https://convex.dev/) (Real-time reactive database, scheduled functions, type-safe APIs)
- **Authentication**: [Clerk](https://clerk.com/) (Multi-site SSO, session management, user directory)
- **Payments & Billing**: [Stripe](https://stripe.com/) (Event ticketing, member subscriptions)
- **Hosting & CI/CD**: [Vercel](https://vercel.com/)

---

## 📖 Documentation Directory (`/docs`)

Detailed technical guides and reference material:

- [**Roles & Permissions Architecture**](docs/roles-and-permissions.md) — Explains the role model (`"user"`, `"member"`, `"dragon"`), security rules, and the strict decoupling of Clerk `"admin"` metadata.
- [**Clerk Membership & Entitlement Sync**](docs/clerk-membership-sync.md) — Cross-site JWT claim synchronization between `tarragon.be` and `guild.tarragon.be`.
- [**Convex Backend Guide**](docs/convex-backend.md) — Database schema, user synchronization, real-time queries, and mutations.
- [**Stripe Integration Guide**](docs/stripe-integration.md) — Payment workflows, webhook handlers, and subscription management.
- [**Vercel Deployment Guide**](docs/deployment-vercel.md) — Production deployment instructions, required environment variables, and build configuration.

---

## 🛠️ Local Development

### 1. Clone & Install Dependencies

```bash
git clone git@github-tarragon:tarragonvzw/cms-website.git
cd cms-website
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and populate the required API keys:

```bash
cp .env.example .env.local
```

Required keys:
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_FRONTEND_API_URL`
- **Convex**: `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`
- **Stripe**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- **TinaCMS**: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `NEXT_PUBLIC_TINA_BRANCH`

### 3. Run Development Servers

In terminal 1 (Next.js + TinaCMS):
```bash
pnpm dev
```

In terminal 2 (Convex backend sync):
```bash
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application. Tina admin is accessible at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🛡️ User Roles & Admin Dashboard

The application implements a 3-tier role hierarchy:
- `"user"`: Default account for all registered visitors.
- `"member"`: Verified club member (`isMember: true`).
- `"dragon"`: Council administrator with access to the `/dragon` admin dashboard (`isMember: true`).

> **Important**: The Clerk/JWT metadata claim `"admin"` is completely independent of the Dragon role and unrelated to this project. Dragon status is strictly determined by Convex (`users.role === "dragon"`).

Council members with the `"dragon"` role see an **"Admin"** button in the top navigation leading to `/dragon`, where they can search users, filter by role, and update user roles.

---

## 📦 Agent Skills

This repository is equipped with agent skills in `.agents/skills/`:
- **Vercel**: `deploy-to-vercel`, `vercel-optimize`, `vercel-react-best-practices`, `vercel-cli-with-tokens`
- **Convex**: Full suite of 25+ Convex skills (`convex`, `convex-expert`, `convex-auth`, `convex-reviewer`, `convex-optimize`, `convex-performance-audit`)
- **Clerk**: Core & Next.js skills (`clerk`, `clerk-setup`, `clerk-cli`, `clerk-nextjs-patterns`, `clerk-billing`, `clerk-webhooks`)
- **Stripe**: Official skills (`stripe-best-practices`, `stripe-docs`, `stripe-projects`, `stripe-apps`, `connect-recommend`)

---

## 🚢 Building & Deployment

Run the build script:
```bash
pnpm build
```

Deploy directly using Vercel CLI:
```bash
vercel --prod
```
