import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { filename: string[] } }): Promise<Metadata> {
    try {
        const path = params.filename.join('/');
        const data = await client.queries.event({
            relativePath: `${path}.mdx`,
        });
        const date = new Date(data.data.event.date);
        const formattedDate = date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });

        return {
            title: `${data.data.event.title} | D&D & Boardgames Kortrijk`,
            description: `Kom naar ${data.data.event.title} op ${formattedDate} bij Tarragon Kortrijk. De gezelligste D&D en boardgame community van West-Vlaanderen!`,
            alternates: {
                canonical: `/event/${path}`,
            }
        };
    } catch (e) {
        return { title: 'Tarragon Event | D&D Kortrijk' };
    }
}

export async function generateStaticParams() {
  const pages = await client.queries.eventConnection();
  
  const paths: any[] = [];
  pages.data?.eventConnection?.edges?.forEach((edge) => {
      const node = edge?.node as any;
      paths.push({
          filename: node?._sys.breadcrumbs,
      });
  });

  return paths;
}


export default async function PostPage({
  params,
}: {
  params: { filename: string[] };
}) {
  const path = params.filename.join('/');
  
  try {
    const data = await client.queries.event({
        relativePath: `${path}.mdx`,
    });

    if (!data.data.event) {
        notFound();
    }

    // Default to 'nl' for events as they don't have a locale prefix in their path
    return (
        <PagePage {...data} locale="nl"></PagePage>
    );
  } catch (e) {
    notFound();
  }
}
