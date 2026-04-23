import { MetadataRoute } from 'next';
import client from '../tina/__generated__/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarragon.be';
  const locales = ['nl', 'en'];

  // Fetch all pages
  const pagesResponse = await client.queries.pageConnection({
    filter: { enabled: { eq: true } }
  });
  const pages: any[] = [];
  pagesResponse.data.pageConnection.edges?.forEach((edge) => {
    const node = edge?.node as any;
    const lang = node?.language || 'nl';
    const filename = node?._sys.filename;
    const url = filename === 'home' 
      ? `${baseUrl}/${lang}` 
      : `${baseUrl}/${lang}/${filename}`;
      
    pages.push({
      url: url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: filename === 'home' ? 1.0 : 0.8,
    });
  });

  // Fetch all events
  const eventsResponse = await client.queries.eventConnection();
  const events: any[] = [];
  const now = new Date();

  eventsResponse.data.eventConnection.edges?.forEach((edge) => {
    const node = edge?.node as any;
    const eventDate = new Date(node?.date || 0);
    const isPast = eventDate < now;

    events.push({
      url: `${baseUrl}/event/${node?._sys.filename}`,
      lastModified: new Date(),
      changeFrequency: isPast ? 'monthly' : 'daily',
      priority: isPast ? 0.3 : 0.7,
    });
  });

  const rootPaths = locales.map(locale => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  return [
    ...rootPaths,
    ...pages,
    ...events,
  ];
}
