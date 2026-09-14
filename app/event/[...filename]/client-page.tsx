"use client";

import ReactMarkdown from "react-markdown";
import SignupSystem from "../signup-system";

interface EventPageProps {
  event: {
    slug: string;
    title: string;
    date: string;
    body: string;
    groups?: {
      name: string;
      description?: string;
      maxSlots: number;
    }[];
  };
}

export default function EventClientPage({ event }: EventPageProps) {
  const eventDate = new Date(event.date);
  const formattedDate = isNaN(eventDate.getTime())
    ? event.date
    : eventDate.toLocaleDateString("nl-BE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="content">
      <h1>{event.title}</h1>
      <h3 style={{ color: "var(--secondary)", textTransform: "capitalize" }}>
        {formattedDate}
      </h3>

      <div className="event-body-markdown">
        <ReactMarkdown>{event.body}</ReactMarkdown>
      </div>

      <SignupSystem
        eventSlug={event.slug}
        eventTitle={event.title || "Tarragon Event"}
        groups={event.groups || []}
      />

      <style jsx>{`
        .event-body-markdown {
          line-height: 1.7;
          color: var(--light);
          margin-top: 1.5rem;
          margin-bottom: 2rem;
        }
        .event-body-markdown :global(h2) {
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--primary_light);
        }
        .event-body-markdown :global(p) {
          margin-bottom: 1.25rem;
        }
        .event-body-markdown :global(ul),
        .event-body-markdown :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .event-body-markdown :global(li) {
          margin-bottom: 0.5rem;
        }
        .event-body-markdown :global(a) {
          color: var(--secondary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
