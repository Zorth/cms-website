"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [locale, setLocale] = useState("nl");

  useEffect(() => {
    // Detect locale from path
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const lang = pathname.startsWith("/en") ? "en" : "nl";
      setLocale(lang);

      // Check if consent has already been given or set
      const consent = localStorage.getItem("tarragon_cookie_consent");
      if (!consent) {
        // Slight delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem("tarragon_cookie_consent", type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isEn = locale === "en";

  return (
    <div className="cookie-consent-overlay" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <div className="cookie-consent-modal">
        <div className="cookie-consent-header">
          <div className="cookie-consent-title-wrap">
            <div className="cookie-icon-box">
              <Cookie size={22} className="cookie-icon" />
            </div>
            <h3>{isEn ? "Privacy & Cookies" : "Privacy & Cookies"}</h3>
          </div>
          <button
            onClick={() => handleAccept("essential")}
            className="cookie-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="cookie-consent-body">
          <p>
            {isEn ? (
              <>
                We use strictly necessary cookies to ensure our website, member authentication, and payments work securely.
                We respect your privacy and comply with the EU General Data Protection Regulation (GDPR). We never track you for cross-site advertising.
              </>
            ) : (
              <>
                Wij gebruiken noodzakelijke cookies voor het beveiligen van onze website, gebruikersaccounts en betalingen.
                Wij respecteren uw privacy en handelen in overeenstemming met de Europese Algemene Verordening Gegevensbescherming (AVG / GDPR). We gebruiken geen trackingcookies van derden voor advertenties.
              </>
            )}
          </p>
          <div className="cookie-consent-links">
            <Link href={`/${locale}/${isEn ? "Privacy-Policy" : "Privacy-Beleid"}`}>
              <ShieldCheck size={16} />
              <span>{isEn ? "Privacy & Cookie Policy" : "Privacybeleid"}</span>
            </Link>
            <Link href={`/${locale}/${isEn ? "ToS" : "Voorwaarden"}`}>
              <span>{isEn ? "Terms of Service" : "Algemene Voorwaarden"}</span>
            </Link>
          </div>
        </div>

        <div className="cookie-consent-actions">
          <button
            type="button"
            onClick={() => handleAccept("essential")}
            className="cookie-btn-secondary"
          >
            {isEn ? "Essential Only" : "Alleen noodzakelijk"}
          </button>
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="cookie-btn-primary"
          >
            {isEn ? "Accept All" : "Alles accepteren"}
          </button>
        </div>
      </div>
    </div>
  );
}
