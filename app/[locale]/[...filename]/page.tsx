import PagePage from "./client-page";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { getConvexClient } from "../../../lib/convex";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ filename: string[]; locale: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.filename.join("/");
    const client = getConvexClient();
    const page = await client.query(api.pages.getPageBySlug, { slug });

    if (!page) {
      return { title: "Tarragon | D&D Kortrijk" };
    }

    const title = page.title;
    const translationSlug = page.translationSlug;

    const languages: Record<string, string> = {};
    languages[resolvedParams.locale] = `/${resolvedParams.locale}/${slug}`;

    if (translationSlug) {
      const targetLocale = resolvedParams.locale === "nl" ? "en" : "nl";
      languages[targetLocale] = `/${targetLocale}/${translationSlug}`;
      languages["x-default"] = `/nl/${
        resolvedParams.locale === "nl" ? slug : translationSlug
      }`;
    } else {
      languages["x-default"] = `/nl/${slug}`;
    }

    return {
      title: `${title} | D&D & Boardgames Kortrijk`,
      alternates: {
        canonical: `/${resolvedParams.locale}/${slug}`,
        languages: languages,
      },
    };
  } catch (e) {
    return { title: "Tarragon | D&D Kortrijk" };
  }
}

export async function generateStaticParams() {
  try {
    const client = getConvexClient();
    const pages = await client.query(api.pages.listPages, { enabled: true });

    return (pages || []).map((page) => ({
      locale: page.language || "nl",
      filename: page.slug.split("/"),
    }));
  } catch (err) {
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ filename: string[]; locale: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.filename.join("/");

  try {
    const client = getConvexClient();
    const page = await client.query(api.pages.getPageBySlug, { slug });

    if (!page || !page.enabled) {
      notFound();
    }

    return <PagePage page={page} />;
  } catch (e) {
    notFound();
  }
}
