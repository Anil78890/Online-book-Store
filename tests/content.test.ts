import { describe, it, expect } from 'vitest';
import {
  toSameOriginProxyUrl,
  stripGutenbergBoilerplate,
  extractChapters,
} from '../src/services/books/content';

describe('toSameOriginProxyUrl security allowlist', () => {
  it('allows safe Project Gutenberg text paths', () => {
    const validUrl1 = 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt';
    expect(toSameOriginProxyUrl(validUrl1)).toBe('/api/gutenberg/cache/epub/1342/pg1342.txt');

    const validUrl2 = 'https://gutenberg.org/ebooks/84.txt.utf-8';
    expect(toSameOriginProxyUrl(validUrl2)).toBe('/api/gutenberg/ebooks/84.txt.utf-8');

    const mirrorUrl = 'https://gutenberg.pglaf.org/cache/epub/1342/pg1342.txt';
    expect(toSameOriginProxyUrl(mirrorUrl)).toBe('/api/gutenberg/cache/epub/1342/pg1342.txt');
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

describe('extractChapters', () => {
  it('extracts standard book chapter headings with offsets and word counts', () => {
    const text = `
CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.

CHAPTER II. The Pool of Tears

Curiouser and curiouser! cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English). Now I am opening out like the largest telescope that ever was! Goodbye, feet!

CHAPTER III. A Caucus-Race and a Long Tale

They were indeed a queer-looking party that assembled on the bank: the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable.
`;

    const chapters = extractChapters(text);

    expect(chapters.length).toBe(3);
    expect(chapters[0]?.title).toBe('CHAPTER I. Down the Rabbit-Hole');
    expect(chapters[1]?.title).toBe('CHAPTER II. The Pool of Tears');
    expect(chapters[2]?.title).toBe('CHAPTER III. A Caucus-Race and a Long Tale');
    expect(chapters[0]?.wordCount).toBeGreaterThan(20);
    expect(chapters[1]?.startIndex).toBeGreaterThan(chapters[0]?.startIndex ?? 0);
  });

  it('provides fallback section chunks for long texts without chapter markers to avoid DOM freeze', () => {
    // Generate text of 6000 words without chapter markers
    const sentence = 'The quick brown fox jumps over the lazy dog and explores the open world. ';
    const longText = sentence.repeat(500); // ~6000 words

    const chapters = extractChapters(longText);

    expect(chapters.length).toBeGreaterThanOrEqual(2);
    expect(chapters[0]?.title).toBe('Section 1');
    expect(chapters[1]?.title).toBe('Section 2');
    expect(chapters[0]?.wordCount).toBeGreaterThanOrEqual(2500);
  });
});

describe('Standard Ebooks HTML extraction', () => {
  it('strips headers, styles, and tags while preserving chapter titles and content', async () => {
    const { stripStandardEbooksHtml } = await import('../src/services/books/adapters/standardEbooksAdapter');
    const rawHtml = `
      <header><nav>Navigation menu</nav></header>
      <section id="chapter-1">
        <h2>Chapter 1</h2>
        <p>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p>
        <p>However little known the feelings or views of such a man may be on his first entering a neighbourhood...</p>
      </section>
    `;

    const clean = stripStandardEbooksHtml(rawHtml);
    expect(clean).toContain('Chapter 1');
    expect(clean).toContain('It is a truth universally acknowledged');
    expect(clean).not.toContain('<p>');
    expect(clean).not.toContain('Navigation menu');
  });
});
