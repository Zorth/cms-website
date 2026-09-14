import { ConvexHttpClient } from "convex/browser";

export const PROD_CONVEX_URL = "https://perceptive-ant-688.eu-west-1.convex.cloud";

export function getConvexUrl(): string {
  return process.env.NEXT_PUBLIC_CONVEX_URL || PROD_CONVEX_URL;
}

export function getConvexClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}
