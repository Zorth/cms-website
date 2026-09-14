"use client";

import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DonationButton } from "../../../components/DonationButton";

interface ClientPageProps {
  page: {
    _id: string;
    slug: string;
    title: string;
    body: string;
    language: string;
    enabled: boolean;
    hideFromHeader?: boolean;
    weight?: number;
    snippet?: string;
    icon?: string;
    iconName?: string;
    translationSlug?: string;
  };
}

export default function PagePage({ page }: ClientPageProps) {
  const targetLocale = page.language === "nl" ? "en" : "nl";
  const translationSlug = page.translationSlug;

  // Render markdown with DonationButton detection if embedded
  const renderMarkdownWithComponents = (content: string) => {
    // Check if content contains <DonationButton ... />
    const donationMatch = content.match(/<DonationButton\s+([^>]*)\/>/);
    if (!donationMatch) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      );
    }

    const before = content.slice(0, donationMatch.index);
    const after = content.slice(donationMatch.index! + donationMatch[0].length);
    const attrString = donationMatch[1];

    const getAttr = (name: string) => {
      const m = attrString.match(new RegExp(`${name}="([^"]*)"`));
      return m ? m[1] : undefined;
    };

    const iban = getAttr("iban") || "BE18 7330 7200 6665";
    const name = getAttr("name") || "Tarragon VZW";
    const bic = getAttr("bic") || "KREDBEBB";
    const message = getAttr("message") || "Donatie";

    return (
      <>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{before}</ReactMarkdown>
        <DonationButton iban={iban} name={name} bic={bic} message={message} />
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{after}</ReactMarkdown>
      </>
    );
  };

  return (
    <div className="content">
      {translationSlug && (
        <div className="language-switcher">
          <Link href={`/${targetLocale}/${translationSlug}`} className="lang-link">
            <Globe size={16} />
            {page.language === "nl" ? "Switch to English" : "Naar het Nederlands"}
          </Link>
        </div>
      )}

      <div className="page-markdown">
        {renderMarkdownWithComponents(page.body)}
      </div>

      <style jsx>{`
        .language-switcher {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }
        .lang-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          padding: 0.4rem 1rem;
          background: rgba(151, 183, 142, 0.05);
          border-radius: 2rem;
          border: 1px solid var(--secondary);
          color: var(--secondary) !important;
          transition: all 0.2s;
          font-family: var(--font-orunde), sans-serif;
          font-weight: 500;
        }
        .lang-link:hover {
          background: var(--secondary);
          color: var(--darker) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .page-markdown {
          line-height: 1.7;
          color: var(--light);
        }
        .page-markdown :global(h1) {
          margin-top: 0;
          margin-bottom: 1.25rem;
        }
        .page-markdown :global(h2) {
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--primary_light);
        }
        .page-markdown :global(h3) {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--secondary);
        }
        .page-markdown :global(p) {
          margin-bottom: 1.25rem;
        }
        .page-markdown :global(ul),
        .page-markdown :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .page-markdown :global(li) {
          margin-bottom: 0.5rem;
        }
        .page-markdown :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .page-markdown :global(th),
        .page-markdown :global(td) {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 0.8rem;
          text-align: left;
        }
        .page-markdown :global(th) {
          background: rgba(255, 255, 255, 0.05);
          color: var(--secondary);
        }
        .page-markdown :global(a) {
          color: var(--secondary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
