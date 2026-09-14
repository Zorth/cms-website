import EventClientPage from "./client-page";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { getConvexClient } from "../../../lib/convex";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ filename: string[] }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.filename.join("/").replace(/\.mdx$/, "");
    const client = getConvexClient();
    const event = await client.query(api.events.getEventBySlug, { slug });

    if (!event) {
      return { title: "Tarragon Event | D&D Kortrijk" };
    }

    const date = new Date(event.date);
    const formattedDate = isNaN(date.getTime())
      ? event.date
      : date.toLocaleDateString("nl-BE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    return {
      title: `${event.title} | D&D & Boardgames Kortrijk`,
      description: `Kom naar ${event.title} op ${formattedDate} bij Tarragon Kortrijk. De gezelligste D&D en boardgame community van West-Vlaanderen!`,
      alternates: {
        canonical: `/event/${slug}`,
      },
    };
  } catch (e) {
    return { title: "Tarragon Event | D&D Kortrijk" };
  }
}

export async function generateStaticParams() {
  try {
    const client = getConvexClient();
    const events = await client.query(api.events.listEvents, { limit: 500 });
    return (events || []).map((ev) => ({
      filename: ev.slug.split("/"),
    }));
  } catch (err) {
    return [];
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ filename: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.filename.join("/").replace(/\.mdx$/, "");

  try {
    const client = getConvexClient();
    const event = await client.query(api.events.getEventBySlug, { slug });

    if (!event) {
      notFound();
    }

    return <EventClientPage event={event} />;
  } catch (e) {
    notFound();
  }
}
