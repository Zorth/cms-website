import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { filename: string[] } }): Promise<Metadata> {
    try {
        const data = await client.queries.event({
            relativePath: `${params.filename}.mdx`,
        });
        return {
            title: data.data.event.title,
            description: `Join us for ${data.data.event.title} on ${new Date(data.data.event.date).toLocaleDateString()}. Register now!`,
            alternates: {
                canonical: `/event/${params.filename}`,
            }
        };
    } catch (e) {
        return { title: 'Tarragon Event' };
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
  const data = await client.queries.event({
    relativePath: `${params.filename}.mdx`,
  });

  // Default to 'nl' for events as they don't have a locale prefix in their path
  return (
    <PagePage {...data} locale="nl"></PagePage>
  );
}
