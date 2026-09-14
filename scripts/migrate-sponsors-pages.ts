import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function main() {
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    "https://frugal-shark-535.eu-west-1.convex.cloud";
  console.log("Convex URL:", convexUrl);
  const client = new ConvexHttpClient(convexUrl);

  // 1. Migrate Sponsors
  const sponsorDir = path.join(process.cwd(), "content/sponsor");
  const sponsorFiles = fs
    .readdirSync(sponsorDir)
    .filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${sponsorFiles.length} sponsor files.`);

  const sponsors: {
    name: string;
    link: string;
    snippet: string;
    body?: string;
    image?: string;
    order?: number;
  }[] = [];

  let sIdx = 0;
  for (const filename of sponsorFiles) {
    const filePath = path.join(sponsorDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(fileContent);

    const name = (parsed.data.name || filename.replace(/\.mdx$/, "")).toString();
    const link = (parsed.data.link || "").toString();
    const snippet = (parsed.data.snippet || "").toString();
    const body = parsed.content.trim() || undefined;
    const image = parsed.data.image ? String(parsed.data.image) : undefined;

    sponsors.push({
      name,
      link,
      snippet,
      body,
      image,
      order: sIdx++,
    });
  }

  const sponsorResult = await client.mutation(api.sponsors.importSponsorsBatch, {
    sponsors,
  });
  console.log(
    `Sponsors migrated! Inserted: ${sponsorResult.inserted}, Updated: ${sponsorResult.updated}, Total: ${sponsors.length}`
  );

  // 2. Migrate Pages
  const pageDir = path.join(process.cwd(), "content/page");
  const pageFiles = fs.readdirSync(pageDir).filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${pageFiles.length} page files.`);

  const pages: {
    slug: string;
    title: string;
    body: string;
    language: string;
    enabled: boolean;
    hideFromHeader?: boolean;
    weight?: number;
    snippet?: string;
    icon?: string;
    iconName?: string;
    translationSlug?: string;
  }[] = [];

  for (const filename of pageFiles) {
    const filePath = path.join(pageDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(fileContent);

    const slug = filename.replace(/\.mdx$/, "");
    const title = (parsed.data.title || slug).toString();
    const body = parsed.content.trim();
    const language = (parsed.data.language || "nl").toString();
    const enabled = parsed.data.enabled !== false;
    const hideFromHeader = Boolean(parsed.data.hideFromHeader);
    const weight =
      typeof parsed.data.weight === "number" ? parsed.data.weight : 100;
    const snippet = parsed.data.snippet ? String(parsed.data.snippet) : undefined;
    const icon = parsed.data.icon ? String(parsed.data.icon) : undefined;
    const iconName = parsed.data.iconName
      ? String(parsed.data.iconName)
      : undefined;

    let translationSlug: string | undefined = undefined;
    if (parsed.data.translation) {
      translationSlug = path
        .basename(String(parsed.data.translation))
        .replace(/\.mdx$/, "");
    }

    pages.push({
      slug,
      title,
      body,
      language,
      enabled,
      hideFromHeader,
      weight,
      snippet,
      icon,
      iconName,
      translationSlug,
    });
  }

  const pageResult = await client.mutation(api.pages.importPagesBatch, {
    pages,
  });
  console.log(
    `Pages migrated! Inserted: ${pageResult.inserted}, Updated: ${pageResult.updated}, Total: ${pages.length}`
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
