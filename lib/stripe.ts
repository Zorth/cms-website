import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2025-02-24.acacia" as any,
  appInfo: {
    name: "Tarragon VZW CMS",
    version: "1.0.0",
  },
});

/**
 * Retrieves the Kobold membership Stripe Price ID.
 * 1. Checks process.env.STRIPE_KOBOLD_PRICE_ID
 * 2. Searches Stripe for a 10 EUR/year recurring price or "Kobold" product
 * 3. In development/test mode, creates the product & price if missing
 */
export async function getKoboldPriceId(): Promise<string> {
  if (process.env.STRIPE_KOBOLD_PRICE_ID) {
    return process.env.STRIPE_KOBOLD_PRICE_ID;
  }

  try {
    // 1. Search existing prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ["data.product"],
    });

    // Match either by metadata plan, product name "Kobold", or 10 EUR yearly recurring
    const existing = prices.data.find((p) => {
      const product = p.product as Stripe.Product;
      const productName = typeof product === "object" ? product.name?.toLowerCase() : "";
      const isKobold = productName.includes("kobold") || p.metadata?.plan === "kobold";
      const isTenEurYearly =
        p.currency === "eur" &&
        p.unit_amount === 1000 &&
        p.recurring?.interval === "year";

      return isKobold || isTenEurYearly;
    });

    if (existing) {
      return existing.id;
    }

    // 2. If none found, create the product and price in Stripe
    console.log("Creating Kobold Membership product and 10 EUR/year price in Stripe...");
    const product = await stripe.products.create({
      name: "Kobold Membership",
      description: "Yearly membership subscription for Tarragon VZW (10 EUR/year)",
      metadata: {
        plan: "kobold",
        organization: "Tarragon VZW",
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // 10.00 EUR
      currency: "eur",
      recurring: {
        interval: "year",
      },
      metadata: {
        plan: "kobold",
      },
    });

    return price.id;
  } catch (error) {
    console.error("Error finding or creating Kobold price in Stripe:", error);
    throw error;
  }
}
