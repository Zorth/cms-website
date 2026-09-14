"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function HeaderPages(props: { locale?: string }) {
  const locale = props.locale || "nl";
  const pages = useQuery(api.pages.listPages, { enabled: true });

  const filteredPages = (pages || [])
    .filter((page) => !page.hideFromHeader)
    .filter(
      (page) =>
        page.language === locale || (!page.language && locale === "nl")
    )
    .sort((a, b) => (a.weight ?? 100) - (b.weight ?? 100));

  return (
    <nav className="header-nav">
      {filteredPages.map((page) => {
        const IconComponent = page.iconName
          ? ((LucideIcons as any)[page.iconName] as LucideIcon)
          : null;

        return (
          <Link
            key={page._id}
            href={`/${locale}/${page.slug}`}
            className="header-nav-link"
            title={page.title || ""}
          >
            {page.icon ? (
              <Image
                src={page.icon}
                alt={page.title || ""}
                width={40}
                height={40}
                className="header-nav-icon"
              />
            ) : IconComponent ? (
              <IconComponent
                size={32}
                className="header-nav-icon"
                color="var(--secondary)"
              />
            ) : (
              <span>{page.title}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
