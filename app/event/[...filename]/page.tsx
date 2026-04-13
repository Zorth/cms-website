import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { filename: string[], locale: string } }): Promise<Metadata> {
...
        const data = await client.queries.event({
            relativePath: `${params.filename}.mdx`,
        });
        return {
            title: data.data.event.title,
            description: `Join us for ${data.data.event.title} on ${new Date(data.data.event.date).toLocaleDateString()}. Register now!`,
            alternates: {
                canonical: `/${params.locale}/event/${params.filename}`,
            }
        };
    } catch (e) {
        return { title: 'Tarragon Event' };
    }
}

export async function generateStaticParams() {
  const locales = ['nl', 'en'];
  const pages = await client.queries.eventConnection();
  
  const paths: any[] = [];
  locales.forEach(locale => {
      pages.data?.eventConnection?.edges?.forEach((edge) => {
          const node = edge?.node as any;
          if (node?.language === locale || (!node?.language && locale === 'nl')) {
              paths.push({
                  locale: locale,
                  filename: node?._sys.breadcrumbs,
              });
          }
      });
  });

  return paths;
}


export default async function PostPage({
  params,
}: {
  params: { filename: string[], locale: string };
}) {
  const locale = params.locale || 'nl';

  const data = await client.queries.event({
    relativePath: `${params.filename}.mdx`,
  });

  return (
    <PagePage {...data} locale={locale}></PagePage>
  );
}
