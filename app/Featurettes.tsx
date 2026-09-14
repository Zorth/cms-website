"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Featurettes({ locale }: { locale: string }) {
  const pages = useQuery(api.pages.listPages, { enabled: true });

  const featurettePages = (pages || [])
    .filter((page) => Boolean(page.snippet && page.snippet.trim().length > 0))
    .filter(
      (page) =>
        page.language === locale || (!page.language && locale === "nl")
    )
    .sort((a, b) => (a.weight ?? 100) - (b.weight ?? 100));

  if (featurettePages.length === 0) {
    return null;
  }

  return (
    <div className="featurettes-container">
      {featurettePages.map((page) => {
        const IconComponent = page.iconName
          ? ((LucideIcons as any)[page.iconName] as LucideIcon)
          : null;

        return (
          <Link
            href={`/${locale}/${page.slug}`}
            key={page._id}
            className="page-snippet"
          >
            {page.icon ? (
              <div className="page-snippet-icon-wrapper">
                <Image
                  src={page.icon}
                  alt={page.title || ""}
                  width={80}
                  height={80}
                  className="page-snippet-icon"
                />
              </div>
            ) : IconComponent ? (
              <div className="page-snippet-icon-wrapper">
                <IconComponent
                  size={64}
                  className="page-snippet-icon"
                  color="var(--secondary)"
                />
              </div>
            ) : null}
            <div className="page-snippet-content">
              <ReactMarkdown>{page.snippet || ""}</ReactMarkdown>
              <span className="page-snippet-more">
                {locale === "nl" ? "Ontdek meer →" : "Explore more →"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
