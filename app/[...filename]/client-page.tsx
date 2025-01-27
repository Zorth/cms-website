"use client"
import { tinaField, useTina } from "tinacms/dist/react";
import { PageQuery } from "../../tina/__generated__/types";
import { TinaMarkdown } from "tinacms/dist/rich-text";

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PageQuery;
}

export default function PagePage(props : ClientPageProps) {
    // data passes though in production mode and data is updated to the sidebar data in edit-mode
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    });
    return (
        <div className="content" data-tina-field={tinaField(data.page, "body")}>
            <TinaMarkdown content={data.page.body} />
        </div>
    );
  }
