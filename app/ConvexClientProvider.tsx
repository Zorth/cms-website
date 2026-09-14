"use client";

import React, { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import UserSync from "./UserSync";

import { getConvexUrl } from "../lib/convex";

const convex = new ConvexReactClient(getConvexUrl());

// Cast ConvexProviderWithClerk to allow React 18 children in Next.js JSX preserve mode
const ConvexClerkProvider = ConvexProviderWithClerk as React.ComponentType<{
  client: any;
  useAuth: any;
  children?: ReactNode;
}>;

export default function ConvexClientProvider({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <ConvexClerkProvider client={convex} useAuth={useAuth}>
      <UserSync />
      {children}
    </ConvexClerkProvider>
  );
}
