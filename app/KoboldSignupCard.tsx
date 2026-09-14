"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  createKoboldCheckoutSessionAction,
  createCustomerPortalSessionAction,
} from "./actions/stripe";

export default function KoboldSignupCard({ locale = "nl" }: { locale?: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const currentUser = useQuery(api.users.getCurrentUser);
  const isMember = currentUser?.role === "member" || currentUser?.role === "dragon";
  const [loading, setLoading] = useState(false);

  // Automatically trigger checkout if the user was prompted to login first
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded && isSignedIn && !isMember) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subscribeKobold") === "true") {
        handleCheckout();
      }
    }
  }, [isLoaded, isSignedIn, isMember]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await createKoboldCheckoutSessionAction(window.location.pathname);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not create Stripe Checkout session.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      setLoading(true);
      const res = await createCustomerPortalSessionAction(window.location.pathname);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not open customer billing portal.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to open billing portal.");
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isSignedIn) {
      // Prompt user to sign in or register, then return back to trigger Stripe
      const currentPath = typeof window !== "undefined" ? window.location.pathname : `/${locale}`;
      const redirectTarget = `${currentPath}?subscribeKobold=true`;
      openSignIn({
        fallbackRedirectUrl: redirectTarget,
        signUpFallbackRedirectUrl: redirectTarget,
      });
      return;
    }

    if (isMember) {
      handleManage();
    } else {
      handleCheckout();
    }
  };

  return (
    <div
      onClick={handleClick}
      key="Signup"
      className="sponsor-snippet red-hover kobold-signup-card"
      style={{
        background: "var(--primary_dark)",
        cursor: "pointer",
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      <h2>
        {loading
          ? (locale === "nl" ? "Even geduld..." : "Loading...")
          : isMember
          ? (locale === "nl" ? "Kobold Lidmaatschap (Actief)" : "Kobold Membership (Active)")
          : (locale === "nl" ? "Word een Kobold!" : "Become a Kobold!")}
      </h2>
      <p>
        {isMember
          ? (locale === "nl"
              ? "Je bent al lid van Tarragon VZW! Klik hier om je lidmaatschap, betaalmethodes en BTW-facturen te beheren."
              : "You are an active member of Tarragon VZW! Click here to manage your subscription, payment methods & VAT invoices.")
          : (locale === "nl"
              ? "Klik hier om lid te worden (10€/jaar). Krijg toegang tot exclusieve deals, prioriteit bij inschrijvingen en korting op evenementen!"
              : "Click here to become a member (10€/year). Get access to membership deals, priority signups, and discounts on events!")}
      </p>
      <div className="kobold-card-footer" style={{ marginTop: "0.75rem" }}>
        <span
          className="kobold-card-cta"
          style={{
            fontWeight: 700,
            color: "var(--secondary, #97b78e)",
            textDecoration: "underline",
          }}
        >
          {loading
            ? "⏳ ..."
            : isMember
            ? (locale === "nl" ? "Beheer facturen & abonnement →" : "Manage subscription & invoices →")
            : (locale === "nl" ? "Word lid voor 10€/jaar →" : "Join for 10€/year →")}
        </span>
      </div>
    </div>
  );
}
