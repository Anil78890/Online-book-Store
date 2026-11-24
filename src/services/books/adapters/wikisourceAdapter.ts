import type { Book } from '../../../types/book';
import type { ProviderAdapter } from './types';
import { fetchJson } from '../http';

interface WikiSearchResult {
  title?: string;
  pageid?: number;
  snippet?: string;
  wordcount?: number;
}

interface WikiSearchResponse {
  query?: {
    search?: WikiSearchResult[];
  };
}

interface WikiParseResponse {
  parse?: {
    title?: string;
    pageid?: number;
    text?: {
      '*'?: string;
    };
    sections?: Array<{ line?: string; level?: string }>;
  };
}

const WIKISOURCE_API_BASE = 'https://en.wikisource.org/w/api.php';

const stripHtmlToPlainText = (html: string): string => {
  return html
    // Remove scripts and styles
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Replace headings with double newlines and marker
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
    // Replace paragraph and break tags
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Clean redundant whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const wikisourceAdapter: ProviderAdapter = {
  source: 'wikisource',
  displayName: 'Wikisource',

  async search(query: string, options): Promise<Book[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const url = `${WIKISOURCE_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&srlimit=${options?.limit ?? 10}&format=json&origin=*`;

    try {
      const data = await fetchJson<WikiSearchResponse>(url, {
        signal: options?.signal,
        cacheMs: 60_000,
      });

      const results = Array.isArray(data.query?.search) ? data.query.search : [];
      return results
        .filter(r => Boolean(r.title && !r.title.includes(':') && r.wordcount && r.wordcount > 50))
        .map(r => {
          const title = r.title || 'Untitled Work';
          const cleanSnippet = r.snippet ? r.snippet.replace(/<[^>]+>/g, '') : undefined;

          return {
            id: encodeURIComponent(title),
            title,
            authors: [{ name: 'Wikisource Contributor Edition' }],
            formats: {
              html: `https://en.wikisource.org/wiki/${encodeURIComponent(title)}`,
            },
            languages: ['en'],
            downloadCount: r.wordcount || 0,
            subjects: ['Wikisource Public Collection'],
            source: 'wikisource',
            sourceUrl: `https://en.wikisource.org/wiki/${encodeURIComponent(title)}`,
            availability: 'full-text',
            readingCapability: 'FULL_TEXT',
            description: cleanSnippet,
            sourceAttribution: 'Wikisource, a Wikimedia project',
            rights: {
              licenseName: 'Creative Commons Attribution-ShareAlike 4.0 / Public Domain',
              licenseUrl: 'https://en.wikisource.org/wiki/Wikisource:Copyrights',
              publicDomainStatus: 'verified',
              attributionText: 'Content available under CC BY-SA 4.0 and Public Domain terms.',
            },
          };
        });
    } catch (error) {
      console.warn('Wikisource search failed:', error);
      return [];
    }
  },

  async getBook(id: string, signal?: AbortSignal): Promise<Book> {
    const pageTitle = decodeURIComponent(id);
    const url = `${WIKISOURCE_API_BASE}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text|sections&format=json&origin=*`;
    const data = await fetchJson<WikiParseResponse>(url, { signal, cacheMs: 180_000 });

    const rawTitle = data.parse?.title || pageTitle;

    return {
      id,
      title: rawTitle,
      authors: [{ name: 'Wikisource Community Edition' }],
      formats: {
        html: `https://en.wikisource.org/wiki/${encodeURIComponent(rawTitle)}`,
      },
      languages: ['en'],
      downloadCount: 0,
      subjects: ['Wikisource'],
      source: 'wikisource',
      sourceUrl: `https://en.wikisource.org/wiki/${encodeURIComponent(rawTitle)}`,
      availability: 'full-text',
      readingCapability: 'FULL_TEXT',
      sourceAttribution: 'Wikisource',
      rights: {
        licenseName: 'CC BY-SA 4.0 / Public Domain',
        licenseUrl: 'https://en.wikisource.org/wiki/Wikisource:Copyrights',
        publicDomainStatus: 'verified',
        attributionText: 'Text preserved by the Wikisource community.',
      },
    };
  },

  async getReadingContent(book: Book, signal?: AbortSignal): Promise<string> {
    const pageTitle = decodeURIComponent(book.id);
    const url = `${WIKISOURCE_API_BASE}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&origin=*`;
    const data = await fetchJson<WikiParseResponse>(url, { signal, cacheMs: 300_000 });

    const html = data.parse?.text?.['*'];
    if (!html) throw new Error('No readable text returned from Wikisource.');

    const clean = stripHtmlToPlainText(html);
    if (!clean || clean.length < 100) throw new Error('Wikisource page contained no book text.');

    return clean;
  },
};
