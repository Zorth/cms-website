"use client"
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import { EventQuery } from "../../../tina/__generated__/types";
import SignupSystem from "../signup-system";

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: EventQuery;
}

export default function Event(props : ClientPageProps) {
    // data passes though in production mode and data is updated to the sidebar data in edit-mode
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    });

    const event_date = new Date(data.event.date || "");

    return (
      <div className="content">
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
              rel="noopener noreferrer" 
              className="signup-button"
              data-tina-field={tinaField(data.event, "signupUrl")}
            >
              Sign Up for this Event
            </a>
          </div>
        )}
      </div>
    );
  }
