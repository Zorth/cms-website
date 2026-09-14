import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-shark-535.eu-west-1.convex.cloud";
  console.log("Convex URL:", convexUrl);
  const client = new ConvexHttpClient(convexUrl);

  const eventDir = path.join(process.cwd(), "content/event");
  const files = fs.readdirSync(eventDir).filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${files.length} MDX files to import.`);

  const batchSize = 10;
  const events: {
    slug: string;
    title: string;
    date: string;
    body: string;
    groups?: { name: string; description?: string; maxSlots: number }[];
  }[] = [];

  for (const filename of files) {
    const filePath = path.join(eventDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(fileContent);

    const slug = filename.replace(/\.mdx$/, "");
    const title = (parsed.data.title || slug).toString();
    
    // Ensure valid ISO date string
    let dateStr: string;
    if (parsed.data.date instanceof Date) {
      dateStr = parsed.data.date.toISOString();
    } else if (typeof parsed.data.date === "string") {
      dateStr = new Date(parsed.data.date).toISOString();
    } else {
      dateStr = new Date().toISOString();
    }

    const body = parsed.content.trim();

    let groups: { name: string; description?: string; maxSlots: number }[] | undefined = undefined;
    if (Array.isArray(parsed.data.groups) && parsed.data.groups.length > 0) {
      groups = parsed.data.groups.map((g: any) => ({
        name: String(g.name || "Group"),
        description: g.description ? String(g.description) : undefined,
        maxSlots: typeof g.maxSlots === "number" ? g.maxSlots : parseInt(g.maxSlots, 10) || 6,
      }));
    }

    events.push({
      slug,
      title,
      date: dateStr,
      body,
      groups,
    });
  }

  let totalInserted = 0;
  let totalUpdated = 0;

  for (let i = 0; i < events.length; i += batchSize) {
    const chunk = events.slice(i, i + batchSize);
    console.log(`Importing batch ${Math.floor(i / batchSize) + 1} (${chunk.length} events)...`);
    const result = await client.mutation(api.events.importEventsBatch, {
      events: chunk,
    });
    totalInserted += result.inserted;
    totalUpdated += result.updated;
  }

  console.log(`Successfully migrated events! Inserted: ${totalInserted}, Updated: ${totalUpdated}, Total: ${events.length}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
