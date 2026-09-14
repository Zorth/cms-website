import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://frugal-shark-535.eu-west-1.convex.cloud";
  console.log("Convex URL:", convexUrl);
  const client = new ConvexHttpClient(convexUrl);

  const dragonDir = path.join(process.cwd(), "content/dragon");
  const files = fs.readdirSync(dragonDir).filter((f) => f.endsWith(".mdx"));

  console.log(`Found ${files.length} Dragon MDX files to import.`);

  const dragons: {
    name: string;
    title?: string;
    image?: string;
    body?: string;
    order?: number;
  }[] = [];

  let idx = 0;
  for (const filename of files) {
    const filePath = path.join(dragonDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(fileContent);

    const name = (parsed.data.name || filename.replace(/\.mdx$/, "")).toString();
    const title = parsed.data.title ? String(parsed.data.title) : undefined;
    const image = parsed.data.image ? String(parsed.data.image) : undefined;
    const body = parsed.content.trim() ? parsed.content.trim() : undefined;

    dragons.push({
      name,
      title,
      image,
      body,
      order: idx++,
    });
  }

  console.log(`Importing ${dragons.length} dragons to Convex...`);
  const result = await client.mutation(api.dragons.importDragonsBatch, {
    dragons,
  });

  console.log(`Successfully migrated dragons! Inserted: ${result.inserted}, Updated: ${result.updated}, Total: ${dragons.length}`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
