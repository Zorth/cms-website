"use client"
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaField, useTina } from "tinacms/dist/react";
import { EventQuery } from "../../../tina/__generated__/types";

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
    return (
      <div>
        <h1 data-tina-field={tinaField(data.event, "title")}>{data.event.title}</h1>
        <h3 data-tina-field={tinaField(data.event, "date")}>{new Date(data.event.date).toDateString()}</h3>
        <div data-tina-field={tinaField(data.event, "body")}>
            <TinaMarkdown content={data.event.body} />
        </div>
        {/* codeblock preview raw event data for debugging
        <pre>
          {JSON.stringify(data.event, null, 2)}
        </pre>
        */}
      </div>
    );
  }
