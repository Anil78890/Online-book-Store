import { describe, it, expect } from 'vitest';
import {
  toSameOriginProxyUrl,
  stripGutenbergBoilerplate,
} from '../src/services/books/content';

describe('toSameOriginProxyUrl security allowlist', () => {
  it('allows safe Project Gutenberg text paths', () => {
    const validUrl1 = 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt';
    expect(toSameOriginProxyUrl(validUrl1)).toBe('/api/gutenberg/cache/epub/1342/pg1342.txt');

    const validUrl2 = 'https://gutenberg.org/ebooks/84.txt.utf-8';
    expect(toSameOriginProxyUrl(validUrl2)).toBe('/api/gutenberg/ebooks/84.txt.utf-8');
  });

  it('rejects non-Gutenberg hosts to prevent acting as an open proxy', () => {
    expect(toSameOriginProxyUrl('https://malicious-site.com/ebook.txt')).toBeNull();
    expect(toSameOriginProxyUrl('https://evil-gutenberg.org/cache/epub/1/pg1.txt')).toBeNull();
    expect(toSameOriginProxyUrl('https://example.com/')).toBeNull();
  });

  it('rejects path traversal and unsafe extensions', () => {
    expect(toSameOriginProxyUrl('https://www.gutenberg.org/cache/epub/../../etc/passwd')).toBeNull();
    expect(toSameOriginProxyUrl('https://www.gutenberg.org/executable.exe')).toBeNull();
    expect(toSameOriginProxyUrl('https://www.gutenberg.org/malware.js')).toBeNull();
  });

  it('rejects malformed URLs gracefully', () => {
    expect(toSameOriginProxyUrl('not a url')).toBeNull();
    expect(toSameOriginProxyUrl('')).toBeNull();
    expect(toSameOriginProxyUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('stripGutenbergBoilerplate', () => {
  it('strips Gutenberg header and footer markers leaving clean text', () => {
    const raw = `
The Project Gutenberg eBook of Alice's Adventures in Wonderland, by Lewis Carroll
*** START OF THE PROJECT GUTENBERG EBOOK ALICE'S ADVENTURES IN WONDERLAND ***

CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank.

*** END OF THE PROJECT GUTENBERG EBOOK ALICE'S ADVENTURES IN WONDERLAND ***
End of Project Gutenberg metadata.
`;

    const cleaned = stripGutenbergBoilerplate(raw);

    expect(cleaned.includes('*** START OF')).toBe(false);
    expect(cleaned.includes('*** END OF')).toBe(false);
    expect(cleaned.includes('CHAPTER I. Down the Rabbit-Hole')).toBe(true);
    expect(cleaned.includes('Alice was beginning to get very tired')).toBe(true);
  });

  it('preserves text without markers intact without throwing', () => {
    const text = 'A clean book text without standard Gutenberg boilerplate markers.';
    expect(stripGutenbergBoilerplate(text)).toBe(text);
  });
});
