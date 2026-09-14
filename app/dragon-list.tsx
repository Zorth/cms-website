"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import TarragonLogo from "../public/images/Tarragon_Full.svg";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function DragonList(props: { locale?: string }) {
  const locale = props.locale || "nl";
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const dragons = useQuery(api.dragons.listDragons);

  const dragonList = (dragons || []).slice().sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

  return (
    <>
      <div className="dragon-list" ref={emblaRef}>
        <div className="dragon-list-container">
          {dragonList.map((dragon) => (
            <DragonSnippet key={dragon._id} dragon={dragon} />
          ))}
        </div>
      </div>
      <Link
        href={
          "https://docs.google.com/forms/d/e/1FAIpQLScC_krQjFrMLFC_0sw6X8DYdp1UFZNfRE2GFqBVZOxqUma-JA/viewform"
        }
        className="dragon-snippet red-hover"
        style={{ background: "var(--primary_dark)" }}
      >
        <h2>
          {locale === "nl" ? "Wil je een dragon worden?" : "Want to become a dragon?"}
        </h2>
        <p>{locale === "nl" ? "Klik hier!" : "Click here!"}</p>
      </Link>
    </>
  );
}

function DragonSnippet({ dragon }: { dragon: any }) {
  return (
    <div className="dragon-snippet-container">
      <div className="dragon-snippet">
        {dragon.image ? (
          <Image
            src={dragon.image}
            alt={dragon.name}
            width={1000}
            height={1000}
            className="dragon-image"
          />
        ) : (
          <Image
            src={TarragonLogo}
            alt={dragon.name}
            width={500}
            height={500}
            className="dragon-image"
          />
        )}
        <h2>{dragon.name}</h2>
        {dragon.title && <h3>{dragon.title}</h3>}
      </div>
    </div>
  );
}
