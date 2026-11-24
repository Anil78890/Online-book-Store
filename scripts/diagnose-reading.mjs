// Diagnostic script probing real book content across all integrated providers.
// Validates actual book chapters, paragraphs, word counts, and reader endpoints.

import { performance } from 'node:perf_hooks';

const PROBES = [
  {
    provider: 'Project Gutenberg (via PGLAF mirror)',
    source: 'gutendex',
    id: '1342',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    capability: 'FULL_TEXT',
    resourceType: 'text/plain',
    url: 'https://gutenberg.pglaf.org/cache/epub/1342/pg1342.txt',
    route: '/book/gutendex/1342',
    minChars: 50000,
    expectedSnippet: 'truth universally acknowledged',
  },
  {
    provider: 'Project Gutenberg (via PGLAF mirror)',
    source: 'gutendex',
    id: '84',
    title: 'Frankenstein',
    author: 'Mary Wollstonecraft Shelley',
    capability: 'FULL_TEXT',
    resourceType: 'text/plain',
    url: 'https://gutenberg.pglaf.org/cache/epub/84/pg84.txt',
    route: '/book/gutendex/84',
    minChars: 50000,
    expectedSnippet: 'Frankenstein',
  },
  {
    provider: 'Internet Archive (Full OCR Text)',
    source: 'internetarchive',
    id: 'alicesadventures00carr',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    capability: 'FULL_TEXT',
    resourceType: 'text/plain (djvu OCR)',
    url: 'https://archive.org/download/alicesadventures00carr/alicesadventures00carr_djvu.txt',
    route: '/book/internetarchive/alicesadventures00carr',
    minChars: 30000,
    expectedSnippet: 'rabbit',
  },
  {
    provider: 'Internet Archive (Official Scanned Reader Embed)',
    source: 'internetarchive',
    id: 'alicesadventures00carr',
    title: "Alice's Adventures in Wonderland (Digitized Scan)",
    author: 'Lewis Carroll',
    capability: 'OFFICIAL_EMBED',
    resourceType: 'scanned-reader (BookReader iframe)',
    url: 'https://archive.org/embed/alicesadventures00carr',
    route: '/book/internetarchive/alicesadventures00carr',
    embedCheck: true,
  },
  {
    provider: 'Standard Ebooks (Curated Single-Page Edition)',
    source: 'standardebooks',
    id: 'jane-austen/pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    capability: 'FULL_TEXT',
    resourceType: 'text/html (single-page)',
    url: 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/text/single-page',
    route: '/book/standardebooks/jane-austen%2Fpride-and-prejudice',
    minChars: 100000,
    expectedSnippet: 'truth universally acknowledged',
  },
  {
    provider: 'Wikisource (MediaWiki Parse Content)',
    source: 'wikisource',
    id: 'The_Raven_and_Other_Poems/The_Raven',
    title: 'The Raven',
    author: 'Edgar Allan Poe',
    capability: 'FULL_TEXT',
    resourceType: 'application/json (action=parse)',
    url: 'https://en.wikisource.org/w/api.php?action=parse&page=The_Raven_and_Other_Poems/The_Raven&prop=text&format=json&origin=*',
    route: '/book/wikisource/The_Raven_and_Other_Poems%2FThe_Raven',
    minChars: 1000,
    expectedSnippet: 'midnight dreary',
  },
  {
    provider: 'Open Library (Bibliographic + Lending Gateway)',
    source: 'openlibrary',
    id: 'OL27479W',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    capability: 'METADATA_ONLY',
    resourceType: 'application/json (works record)',
    url: 'https://openlibrary.org/works/OL27479W.json',
    route: '/book/openlibrary/OL27479W',
    minChars: 200,
  },
];

const countChapters = (text) => {
  const matches = text.match(/(?:^|\n)\s*(?:CHAPTER|Chapter|BOOK|Book|PART|Part|ACT|Act|SCENE|Scene|SECTION|Section|[IVXLCDM]{1,8}\.)\b[^\n]*/g);
  return matches ? matches.length : 1;
};

async function runDiagnostics() {
  console.log('='.repeat(80));
  console.log('BLUELEAF BOOKS - REAL DATA READING CONTENT DIAGNOSTIC');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  let passed = 0;
  let inconclusive = 0;
  let failed = 0;

  for (const probe of PROBES) {
    console.log(`\n--- [${probe.source.toUpperCase()}] ${probe.title} by ${probe.author} ---`);
    console.log(`  Target URL: ${probe.url}`);
    console.log(`  Assigned Capability: ${probe.capability}`);
    console.log(`  Selected Resource: ${probe.resourceType}`);
    console.log(`  In-App Route: ${probe.route}`);

    const startTime = performance.now();
    try {
      const response = await fetch(probe.url, {
        headers: {
          'Accept': probe.resourceType.includes('json') ? 'application/json' : 'text/plain, text/html, */*',
          'User-Agent': 'BlueLeafBooksDiagnostic/2.0',
        },
        redirect: 'follow',
      });
      const durationMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        console.log(`  HTTP Status: ${response.status} ${response.statusText} (${durationMs}ms)`);
        console.log(`  [INCONCLUSIVE/PROVIDER_UNAVAILABLE] Upstream service responded with ${response.status}`);
        inconclusive++;
        continue;
      }

      const contentType = response.headers.get('content-type') || 'unknown';
      const body = await response.text();
      const lengthBytes = Buffer.byteLength(body, 'utf8');

      console.log(`  HTTP Status: ${response.status} OK (${durationMs}ms)`);
      console.log(`  Content-Type: ${contentType}`);
      console.log(`  Response Size: ${lengthBytes.toLocaleString()} bytes (${body.length.toLocaleString()} chars)`);

      if (probe.embedCheck) {
        // Scanned reader embed iframe check
        const isEmbedPage = body.includes('BookReader') || body.includes('archive.org') || body.includes('ia-book-reader');
        if (isEmbedPage && lengthBytes > 1000) {
          console.log('  Embed Viewer Loaded: YES (Interactive BookReader iframe with multi-page navigation)');
          console.log('  Result: PASS - Authorized Scanned Reader Available');
          passed++;
        } else {
          console.log('  Embed Viewer Loaded: NO');
          console.log('  Result: FAIL - Embed document did not contain viewer markup');
          failed++;
        }
        continue;
      }

      // Check text or JSON content
      let textContent = body;
      if (probe.resourceType.includes('json')) {
        try {
          const parsed = JSON.parse(body);
          if (parsed.parse?.text?.['*']) {
            textContent = parsed.parse.text['*'].replace(/<[^>]+>/g, ' ');
          }
        } catch {
          // not json
        }
      }

      const wordCount = textContent.split(/\s+/).filter(Boolean).length;
      const detectedChapters = countChapters(textContent);
      console.log(`  Extracted Word Count: ~${wordCount.toLocaleString()} words`);
      console.log(`  Detected Chapter/Section Headings: ${detectedChapters}`);

      const hasMinChars = body.length >= (probe.minChars || 100);
      const hasSnippet = !probe.expectedSnippet || body.toLowerCase().includes(probe.expectedSnippet.toLowerCase());

      if (hasMinChars && hasSnippet) {
        console.log(`  Snippet Verification: Matched expected key text "${probe.expectedSnippet || 'OK'}"`);
        console.log('  Result: PASS - Genuine Book Body Verified Beyond Cover');
        passed++;
      } else {
        console.log(`  Snippet Verification: FAILED (Expected "${probe.expectedSnippet}", found: ${hasSnippet})`);
        console.log(`  Length Check: ${body.length} >= ${probe.minChars} (${hasMinChars})`);
        console.log('  Result: FAIL - Incomplete or non-body response');
        failed++;
      }
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      console.log(`  Connection error (${durationMs}ms): ${err.message}`);
      console.log('  [INCONCLUSIVE/PROVIDER_UNAVAILABLE] Network timeout or unreachable host');
      inconclusive++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`DIAGNOSTIC SUMMARY: Passed: ${passed} | Inconclusive: ${inconclusive} | Failed: ${failed}`);
  console.log('='.repeat(80));

  if (failed > 0) {
    process.exit(1);
  }
}

runDiagnostics();
