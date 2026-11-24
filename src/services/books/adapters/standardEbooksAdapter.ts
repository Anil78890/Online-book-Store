import type { Book } from '../../../types/book';
import type { ProviderAdapter } from './types';

interface StandardEbookEntry {
  title: string;
  author: string;
  slug: string;
  summary: string;
  url: string;
  epubUrl?: string;
}

let cachedEntries: StandardEbookEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60_000; // 1 hour

const parseAtomFeed = (xml: string): StandardEbookEntry[] => {
  const entries: StandardEbookEntry[] = [];
  const rawEntries = xml.split('<entry>');

  for (let i = 1; i < rawEntries.length; i++) {
    const block = rawEntries[i];
    const titleMatch = block.match(/<title>([^<]+)<\/title>/);
    const authorMatch = block.match(/<author>\s*<name>([^<]+)<\/name>/);
    const idMatch = block.match(/<id>([^<]+)<\/id>/);
    const summaryMatch = block.match(/<summary[^>]*>([^<]+)<\/summary>/);
    const epubMatch = block.match(/href="([^"]+\.epub)"/);

    if (titleMatch && idMatch) {
      const url = idMatch[1].trim();
      const slugMatch = url.match(/\/ebooks\/([^/]+\/[^/]+)/);
      const slug = slugMatch ? slugMatch[1] : url.split('/').pop() || '';

      entries.push({
        title: titleMatch[1].trim(),
        author: authorMatch ? authorMatch[1].trim() : 'Public Domain Author',
        slug,
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        url,
        epubUrl: epubMatch ? epubMatch[1] : undefined,
      });
    }
  }

  return entries;
};

const getOrFetchEntries = async (signal?: AbortSignal): Promise<StandardEbookEntry[]> => {
  if (cachedEntries && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedEntries;
  }

  try {
    const res = await fetch('https://standardebooks.org/feeds/atom/new-releases', {
      signal,
      headers: { Accept: 'application/atom+xml, text/xml, application/xml' },
    });
    if (!res.ok) return cachedEntries || [];
    const text = await res.text();
    cachedEntries = parseAtomFeed(text);
    cacheTimestamp = Date.now();
    return cachedEntries;
  } catch (error) {
    console.warn('Standard Ebooks feed fetch failed:', error);
    return cachedEntries || [];
  }
};

const toBook = (entry: StandardEbookEntry): Book => {
  const id = encodeURIComponent(entry.slug);
  return {
    id,
    title: entry.title,
    authors: [{ name: entry.author }],
    formats: {
      html: `https://standardebooks.org/ebooks/${entry.slug}/text/single-page`,
      epub: entry.epubUrl,
    },
    languages: ['en'],
    downloadCount: 0,
    subjects: ['Standard Ebooks Curated Classics', 'Public Domain Literature'],
    source: 'standardebooks',
    sourceUrl: entry.url || `https://standardebooks.org/ebooks/${entry.slug}`,
    availability: 'full-text',
    readingCapability: 'FULL_TEXT',
    description: entry.summary,
    sourceAttribution: 'Standard Ebooks, volunteer-driven typography',
    rights: {
      licenseName: 'Public Domain / Free and open access (CC0 1.0)',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      publicDomainStatus: 'verified',
      attributionText: 'Carefully formatted and released into the public domain by Standard Ebooks.',
    },
  };
};

export const standardEbooksAdapter: ProviderAdapter = {
  source: 'standardebooks',
  displayName: 'Standard Ebooks',

  async search(query: string, options): Promise<Book[]> {
    const entries = await getOrFetchEntries(options?.signal);
    const cleanQ = query.toLowerCase().trim();
    if (!cleanQ) return entries.slice(0, options?.limit ?? 10).map(toBook);

    const matches = entries.filter(
      e =>
        e.title.toLowerCase().includes(cleanQ) ||
        e.author.toLowerCase().includes(cleanQ) ||
        e.summary.toLowerCase().includes(cleanQ),
    );

    return matches.slice(0, options?.limit ?? 10).map(toBook);
  },

  async browseSubject(_subject: string, options): Promise<Book[]> {
    const entries = await getOrFetchEntries(options?.signal);
    return entries.slice(0, options?.limit ?? 10).map(toBook);
  },

  async getBook(id: string, signal?: AbortSignal): Promise<Book> {
    const entries = await getOrFetchEntries(signal);
    const decodedSlug = decodeURIComponent(id);
    const found = entries.find(e => e.slug === decodedSlug || encodeURIComponent(e.slug) === id);

    if (found) return toBook(found);

    // Fallback if not in recent feed
    return {
      id,
      title: decodedSlug.split('/').pop()?.replace(/-/g, ' ') || 'Standard Ebooks Title',
      authors: [{ name: 'Standard Ebooks Author' }],
      formats: {
        html: `https://standardebooks.org/ebooks/${decodedSlug}/text/single-page`,
      },
      languages: ['en'],
      downloadCount: 0,
      subjects: ['Standard Ebooks'],
      source: 'standardebooks',
      sourceUrl: `https://standardebooks.org/ebooks/${decodedSlug}`,
      availability: 'full-text',
      readingCapability: 'FULL_TEXT',
      sourceAttribution: 'Standard Ebooks',
      rights: {
        licenseName: 'Public Domain (CC0 1.0)',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        publicDomainStatus: 'verified',
        attributionText: 'Standard Ebooks public domain edition.',
      },
    };
  },
};
