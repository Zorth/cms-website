import PagePage from "./client-page";
import client from "../../../tina/__generated__/client";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ filename: string[], locale: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const path = resolvedParams.filename.join('/');
        const data = await client.queries.page({
            relativePath: `${path}.mdx`,
        });

        const title = data.data.page.title;
        const translation = data.data.page.translation as any;

        const languages: Record<string, string> = {};
        languages[resolvedParams.locale] = `/${resolvedParams.locale}/${path}`;

        if (translation && translation._sys) {
            const targetLocale = resolvedParams.locale === 'nl' ? 'en' : 'nl';
            languages[targetLocale] = `/${targetLocale}/${translation._sys.filename}`;
            languages['x-default'] = `/nl/${resolvedParams.locale === 'nl' ? path : translation._sys.filename}`;
        } else {
            languages['x-default'] = `/nl/${path}`;
        }

        return {
            title: `${title} | D&D & Boardgames Kortrijk`,
            alternates: {
                canonical: `/${resolvedParams.locale}/${path}`,
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
    params: Promise<{ filename: string[], locale: string }>;
}) {
    const resolvedParams = await params;
    const locale = resolvedParams.locale || 'nl';
    const path = resolvedParams.filename.join('/');

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
