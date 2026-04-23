import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { filename: string[], locale: string } }): Promise<Metadata> {
    try {
        const path = params.filename.join('/');
        const data = await client.queries.page({
            relativePath: `${path}.mdx`,
        });

        const title = data.data.page.title;
        const translation = data.data.page.translation as any;

        const languages: Record<string, string> = {};
        languages[params.locale] = `/${params.locale}/${path}`;

        if (translation && translation._sys) {
            const targetLocale = params.locale === 'nl' ? 'en' : 'nl';
            languages[targetLocale] = `/${targetLocale}/${translation._sys.filename}`;
            languages['x-default'] = `/nl/${params.locale === 'nl' ? path : translation._sys.filename}`;
        } else {
            languages['x-default'] = `/nl/${path}`;
        }

        return {
            title: `${title} | D&D & Boardgames Kortrijk`,
            alternates: {
                canonical: `/${params.locale}/${path}`,
                languages: languages,
            }
        };
    } catch (e) {
        return { title: 'Tarragon | D&D Kortrijk' };
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
    const path = params.filename.join('/');

    try {
        const data = await client.queries.page({
            relativePath: `${path}.mdx`,
        });

        if (!data.data.page) {
            notFound();
        }

        return (
            <PagePage {...data} locale={locale}></PagePage>
        );
    } catch (e) {
        notFound();
    }
}
