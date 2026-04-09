"use client"
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import { EventQuery } from "../../../../tina/__generated__/types";
import SignupSystem from "../signup-system";
import Link from "next/link";
import { Globe } from "lucide-react";

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: EventQuery;
  locale: string;
}

export default function PagePage(props : ClientPageProps) {
    // data passes though in production mode and data is updated to the sidebar data in edit-mode
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    });

    const event_date = new Date(data.event.date);
    const translation = (data.event as any).translation;
    const targetLocale = (data.event as any).language === 'nl' ? 'en' : 'nl';

    return (
      <div className="content">
        {translation && (
          <div className="language-switcher">
            <Link href={`/${targetLocale}/event/${(translation as any)._sys.filename}`} className="lang-link">
              <Globe size={16} />
              {(data.event as any).language === 'nl' ? 'Switch to English' : 'Naar het Nederlands'}
            </Link>
          </div>
        )}
        <h1 data-tina-field={tinaField(data.event, "title")}>{data.event.title}</h1>
        <h3 data-tina-field={tinaField(data.event, "date")}>{event_date.toDateString()}</h3>
        <div data-tina-field={tinaField(data.event, "body")}>
            <TinaMarkdown content={data.event.body} />
        </div>

        <SignupSystem 
          eventSlug={props.variables.relativePath || ""}
          eventTitle={data.event.title || "Tarragon Event"}
          groups={data.event.groups as any || []}
        />

        {data.event.signupUrl && (
          <div className="signup-container">
            <a 
              href={data.event.signupUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="signup-button"
              data-tina-field={tinaField(data.event, "signupUrl")}
            >
              Sign Up for this Event
            </a>
          </div>
        )}

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
        `}</style>
      </div>
    );
  }
