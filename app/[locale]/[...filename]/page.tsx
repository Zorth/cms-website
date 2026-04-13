import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { filename: string[], locale: string } }): Promise<Metadata> {
...
        const data = await client.queries.page({
            relativePath: `${params.filename}.mdx`,
        });
        return {
            title: data.data.page.title,
            alternates: {
                canonical: `/${params.locale}/${params.filename}`,
            }
        };
    } catch (e) {
        return { title: 'Tarragon' };
    }
}

export async function generateStaticParams() {
    const locales = ['nl', 'en'];
    const pages = await client.queries.pageConnection({
        filter: { enabled: { eq: true } }
    });
    
    const paths: any[] = [];
    locales.forEach(locale => {
        pages.data?.pageConnection?.edges?.forEach((edge) => {
            if (edge?.node?.language === locale) {
                paths.push({
                    locale: locale,
                    filename: edge?.node?._sys.breadcrumbs,
                });
            }
        });
    });

    return paths;
}


export default async function Page({
    params,
}: {
    params: { filename: string[], locale: string };
}) {
    const locale = params.locale || 'nl';

    const data = await client.queries.page({
        relativePath: `${params.filename}.mdx`,
    });

    if (data.data.page.enabled) {
        return (
            <PagePage {...data} locale={locale}></PagePage>
        );
    }
    else {
        return <>Woopsies, this page is not on right now...</>
    }
}
