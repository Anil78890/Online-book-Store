import type { BookSource } from '../../../types/book';
import type { ProviderAdapter } from './types';
import { gutendexAdapter } from './gutendexAdapter';
import { openLibraryAdapter } from './openLibraryAdapter';
import { internetArchiveAdapter } from './internetArchiveAdapter';
import { wikisourceAdapter } from './wikisourceAdapter';
import { standardEbooksAdapter } from './standardEbooksAdapter';

const ADAPTERS: Record<BookSource, ProviderAdapter> = {
  gutendex: gutendexAdapter,
  openlibrary: openLibraryAdapter,
  internetarchive: internetArchiveAdapter,
  wikisource: wikisourceAdapter,
  standardebooks: standardEbooksAdapter,
};

export const getAdapter = (source: BookSource): ProviderAdapter => {
  const adapter = ADAPTERS[source];
  if (!adapter) throw new Error(`Unsupported book provider source: "${source}".`);
  return adapter;
};

export const getAllAdapters = (): ProviderAdapter[] => Object.values(ADAPTERS);

export const getSupportedSources = (): BookSource[] => Object.keys(ADAPTERS) as BookSource[];

export const getProviderDisplayName = (source: BookSource): string => {
  return ADAPTERS[source]?.displayName || source;
};
