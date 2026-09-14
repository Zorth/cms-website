"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  createKoboldCheckoutSessionAction,
  createCustomerPortalSessionAction,
} from "./actions/stripe";

export default function MembershipSection() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDragon = currentUser?.role === "dragon";
  const isMember = currentUser?.role === "member" || isDragon;
  const hasStripeCustomer = Boolean(currentUser?.stripeCustomerId);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await createKoboldCheckoutSessionAction();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not start checkout session.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await createCustomerPortalSessionAction();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Could not open billing portal.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to open billing portal.");
      setLoading(false);
    }
  };

  return (
    <div className="membership-profile-page">
      <div className="membership-card">
        <div className="membership-header">
          <div className="membership-icon">🦎</div>
          <div>
            <h3 className="membership-title">Kobold Membership</h3>
            <p className="membership-subtitle">
              Tarragon VZW • Non-Profit Tabletop Community
            </p>
          </div>
        </div>

        {isDragon ? (
          <div className="membership-status-box status-active">
            <div className="status-badge-row">
              <span className="badge-pill badge-dragon">Dragon Council</span>
              <span className="badge-pill badge-active">Full Access Active</span>
            </div>
            <p className="status-desc">
              As a Dragon council member, your account includes all active Kobold
              membership benefits across <strong>tarragon.be</strong> and{" "}
              <strong>guild.tarragon.be</strong>.
            </p>
            {hasStripeCustomer && (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="btn-manage-billing"
              >
                {loading ? "Opening Portal..." : "Manage Billing & VAT Invoices"}
              </button>
            )}
          </div>
        ) : isMember ? (
          <div className="membership-status-box status-active">
            <div className="status-badge-row">
              <span className="badge-pill badge-member">Kobold Member</span>
              <span className="badge-pill badge-active">Active (10 EUR / year)</span>
            </div>
            <p className="status-desc">
              Thank you for supporting Tarragon VZW! Your Kobold membership is active.
              You have access to priority event signups and member privileges.
            </p>
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="btn-manage-billing"
            >
              {loading ? "Opening Portal..." : "Manage Subscription & VAT Invoices"}
            </button>
          </div>
        ) : (
          <div className="membership-offer-box">
            <div className="price-tag">
              <span className="price-currency">€</span>
              <span className="price-amount">10</span>
              <span className="price-interval">/ year</span>
            </div>

            <ul className="membership-benefits-list">
              <li>
                <span className="check-icon">✓</span> Priority signups for weekly D&D, boardgames & events
              </li>
              <li>
                <span className="check-icon">✓</span> Member discounts on paid workshops and tournaments
              </li>
              <li>
                <span className="check-icon">✓</span> Access to member-only guild features across Tarragon
              </li>
              <li>
                <span className="check-icon">✓</span> Directly support our non-profit tabletop clubhouse in Kortrijk
              </li>
            </ul>

            <div className="vat-notice">
              <p>
                ⚖️ <strong>VAT / BTW Included:</strong> Processed directly via Stripe by
                <strong> Tarragon VZW</strong>. Official Belgian VAT receipts and invoices are
                available in the billing portal.
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-subscribe-kobold"
            >
              {loading ? "Preparing Checkout..." : "Subscribe to Kobold (10 EUR / year)"}
            </button>
          </div>
        )}

        {error && (
          <div className="membership-error-box">
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
