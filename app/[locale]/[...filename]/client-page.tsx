"use client"
import { tinaField, useTina } from "tinacms/dist/react";
import { PageQuery } from "../../../tina/__generated__/types";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Link from "next/link";
import { Globe } from "lucide-react";

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PageQuery;
  locale: string;
}

export default function PagePage(props : ClientPageProps) {
    // data passes though in production mode and data is updated to the sidebar data in edit-mode
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    });

    const translation = data.page.translation;
    const targetLocale = data.page.language === 'nl' ? 'en' : 'nl';

    return (
        <div className="content">
            {translation && (
              <div className="language-switcher">
                <Link href={`/${targetLocale}/${(translation as any)._sys.filename}`} className="lang-link">
                  <Globe size={16} />
                  {data.page.language === 'nl' ? 'Switch to English' : 'Naar het Nederlands'}
                </Link>
              </div>
            )}
            <div data-tina-field={tinaField(data.page, "body")}>
                <TinaMarkdown content={data.page.body} />
            </div>

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
