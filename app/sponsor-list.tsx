"use client";

import React from "react";
import Image from "next/image";
import "./homepage.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import KoboldSignupCard from "./KoboldSignupCard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function SponsorList(props: { locale?: string }) {
  const locale = props.locale || "nl";
  const sponsors = useQuery(api.sponsors.listSponsors, {});

  const sponsorList = (sponsors || [])
    .slice()
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

  return (
    <div className="sponsor-list">
      <KoboldSignupCard locale={locale} />
      {sponsorList.map((sponsor) => (
        <SponsorSnippet key={sponsor._id} sponsor={sponsor} />
      ))}
    </div>
  );
}

function SponsorSnippet({ sponsor }: { sponsor: any }) {
  return (
    <Link
      href={sponsor.link}
      key={sponsor._id}
      className="sponsor-snippet red-hover"
      target="_blank"
      rel="noreferrer"
    >
      {sponsor.image ? (
        <Image
          src={sponsor.image}
          alt={sponsor.name}
          width={500}
          height={500}
          className="sponsor-image"
        />
      ) : null}
      <div className="sponsor-snippet-text">
        <ReactMarkdown>{sponsor.snippet}</ReactMarkdown>
      </div>
    </Link>
  );
}
