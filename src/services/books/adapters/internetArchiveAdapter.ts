import type { Book, BookAuthor } from '../../../types/book';
import type { ProviderAdapter } from './types';
import { fetchJson } from '../http';

interface IaDoc {
  identifier?: string;
  title?: string;
  creator?: string;
  description?: string;
  publicdate?: string;
  licenseurl?: string;
  mediatype?: string;
  subject?: string | string[];
}

interface IaSearchResponse {
  response?: {
    numFound?: number;
    docs?: IaDoc[];
  };
}

interface IaMetadataFile {
  name: string;
  format?: string;
  size?: string;
}

interface IaMetadataResponse {
  server?: string;
  dir?: string;
  metadata?: Record<string, unknown>;
  files?: IaMetadataFile[];
}

const normalizeIaDoc = (doc: IaDoc): Book | null => {
  if (!doc.identifier || !doc.title || typeof doc.identifier !== 'string' || typeof doc.title !== 'string') {
    return null;
  }

  const id = doc.identifier.trim();
  const title = doc.title.trim();
  const authors: BookAuthor[] = doc.creator && typeof doc.creator === 'string'
    ? [{ name: doc.creator.trim() }]
    : [{ name: 'Internet Archive Contributor' }];

  const subjects: string[] = Array.isArray(doc.subject)
    ? doc.subject.filter((s): s is string => typeof s === 'string')
    : typeof doc.subject === 'string'
      ? doc.subject.split(';').map(s => s.trim()).filter(Boolean)
      : [];

  return {
    id,
    title,
    authors,
    formats: {
      image: `https://archive.org/services/img/${encodeURIComponent(id)}`,
      plainText: `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(id)}_djvu.txt`,
    },
    languages: [],
    downloadCount: 0,
    subjects,
    source: 'internetarchive',
    sourceUrl: `https://archive.org/details/${encodeURIComponent(id)}`,
    availability: 'full-text',
    readingCapability: 'OFFICIAL_EMBED',
    iaId: id,
    externalReaderUrl: `https://archive.org/embed/${encodeURIComponent(id)}`,
    description: typeof doc.description === 'string' ? doc.description.slice(0, 500) : undefined,
    sourceAttribution: 'Internet Archive Digital Library',
    rights: {
      licenseName: doc.licenseurl ? 'Public / Permitted Access' : 'Public Collection',
      licenseUrl: doc.licenseurl || 'https://archive.org/about/terms.php',
      publicDomainStatus: 'provider-claimed',
      attributionText: 'Digitized and hosted by the Internet Archive.',
    },
  };
};

export const internetArchiveAdapter: ProviderAdapter = {
  source: 'internetarchive',
  displayName: 'Internet Archive',

  async search(query: string, options): Promise<Book[]> {
    const cleanQuery = query.replace(/[^\w\s]/g, ' ').trim();
    if (!cleanQuery) return [];

    const url = `https://archive.org/advancedsearch.php?q=(${encodeURIComponent(cleanQuery)})+AND+mediatype%3A(texts)&fl[]=identifier,title,creator,publicdate,licenseurl,subject,description&rows=${options?.limit ?? 12}&output=json`;

    try {
      const data = await fetchJson<IaSearchResponse>(url, {
        signal: options?.signal,
        cacheMs: 60_000,
      });

      const docs = Array.isArray(data.response?.docs) ? data.response.docs : [];
      return docs.map(normalizeIaDoc).filter((b): b is Book => Boolean(b));
    } catch (error) {
      console.warn('Internet Archive search failed:', error);
      return [];
    }
  },

  async browseSubject(subject: string, options): Promise<Book[]> {
    const cleanSubject = subject.replace(/[^\w\s]/g, ' ').trim();
    const url = `https://archive.org/advancedsearch.php?q=subject%3A(${encodeURIComponent(cleanSubject)})+AND+mediatype%3A(texts)&fl[]=identifier,title,creator,publicdate,licenseurl,subject,description&rows=${options?.limit ?? 12}&output=json`;

    try {
      const data = await fetchJson<IaSearchResponse>(url, {
        signal: options?.signal,
        cacheMs: 120_000,
      });

      const docs = Array.isArray(data.response?.docs) ? data.response.docs : [];
      return docs.map(normalizeIaDoc).filter((b): b is Book => Boolean(b));
    } catch (error) {
      console.warn('Internet Archive browseSubject failed:', error);
      return [];
    }
  },

  async getBook(id: string, signal?: AbortSignal): Promise<Book> {
    const url = `https://archive.org/metadata/${encodeURIComponent(id)}`;
    const data = await fetchJson<IaMetadataResponse>(url, { signal, cacheMs: 300_000 });

    const rawMeta = data.metadata || {};
    const title = typeof rawMeta.title === 'string' ? rawMeta.title : id;
    const creator = typeof rawMeta.creator === 'string' ? rawMeta.creator : 'Internet Archive Contributor';

    const hasDjvuText = Array.isArray(data.files) && data.files.some(f => f.name.endsWith('_djvu.txt'));

    return {
      id,
      title,
      authors: [{ name: creator }],
      formats: {
        image: `https://archive.org/services/img/${encodeURIComponent(id)}`,
        plainText: hasDjvuText ? `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(id)}_djvu.txt` : undefined,
      },
      languages: [],
      downloadCount: 0,
      subjects: [],
      source: 'internetarchive',
      sourceUrl: `https://archive.org/details/${encodeURIComponent(id)}`,
      availability: 'full-text',
      readingCapability: hasDjvuText ? 'FULL_TEXT' : 'OFFICIAL_EMBED',
      iaId: id,
      externalReaderUrl: `https://archive.org/embed/${encodeURIComponent(id)}`,
      sourceAttribution: 'Internet Archive',
      rights: {
        licenseName: 'Public Domain / Free Collection',
        licenseUrl: 'https://archive.org/about/terms.php',
        publicDomainStatus: 'provider-claimed',
        attributionText: 'Internet Archive open collections.',
      },
    };
  },
};
