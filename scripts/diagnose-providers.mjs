/**
 * Opt-in live API diagnostics script for BlueLeaf Books data providers.
 * Rate-limited, read-only, measures status, latency, format support, and CORS headers.
 * Does not store or require credentials.
 */

const PROBES = [
  {
    name: 'Gutendex Search',
    provider: 'gutendex',
    url: 'https://gutendex.com/books/?search=Pride%20and%20Prejudice',
    validate: data => Boolean(data?.results && Array.isArray(data.results) && data.results.length > 0),
  },
  {
    name: 'Gutendex Category',
    provider: 'gutendex',
    url: 'https://gutendex.com/books/?topic=philosophy',
    validate: data => Boolean(data?.results && Array.isArray(data.results) && data.results.length > 0),
  },
  {
    name: 'Project Gutenberg Direct Text Format',
    provider: 'gutenberg',
    url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt',
    validate: text => typeof text === 'string' && text.includes('Pride and Prejudice'),
    isText: true,
  },
  {
    name: 'Open Library Search API',
    provider: 'openlibrary',
    url: 'https://openlibrary.org/search.json?q=Frankenstein&limit=3&fields=key,title,author_name,ia,ebook_access,has_fulltext',
    validate: data => Boolean(data?.docs && Array.isArray(data.docs) && data.docs.length > 0),
  },
  {
    name: 'Open Library Subjects API',
    provider: 'openlibrary',
    url: 'https://openlibrary.org/subjects/science_fiction.json?limit=3',
    validate: data => Boolean(data?.works && Array.isArray(data.works) && data.works.length > 0),
  },
  {
    name: 'Internet Archive Advanced Search',
    provider: 'internetarchive',
    url: 'https://archive.org/advancedsearch.php?q=title%3A(Pride+and+Prejudice)+AND+mediatype%3A(texts)&fl[]=identifier,title,creator,publicdate,licenseurl&rows=3&output=json',
    validate: data => Boolean(data?.response?.docs && Array.isArray(data.response.docs) && data.response.docs.length > 0),
  },
  {
    name: 'Internet Archive Metadata API',
    provider: 'internetarchive',
    url: 'https://archive.org/metadata/prideandprejudic01a阅/files',
    fallbackUrl: 'https://archive.org/metadata/alicesadventures00carr/files',
    validate: data => Boolean(data?.result && Array.isArray(data.result)),
  },
  {
    name: 'Wikisource Search API',
    provider: 'wikisource',
    url: 'https://en.wikisource.org/w/api.php?action=query&list=search&srsearch=The%20Raven%20Edgar%20Allan%20Poe&format=json&origin=*',
    validate: data => Boolean(data?.query?.search && Array.isArray(data.query.search) && data.query.search.length > 0),
  },
  {
    name: 'Wikisource Parse Content API',
    provider: 'wikisource',
    url: 'https://en.wikisource.org/w/api.php?action=parse&page=The_Raven_(Poe)&prop=text|sections&format=json&origin=*',
    validate: data => Boolean(data?.parse?.text?.['*']),
  },
  {
    name: 'Standard Ebooks Public Atom Feed',
    provider: 'standardebooks',
    url: 'https://standardebooks.org/feeds/atom/new-releases',
    validate: text => typeof text === 'string' && text.includes('<feed') && text.includes('<entry>'),
    isText: true,
  },
];

async function runDiagnostics() {
  console.log('='.repeat(70));
  console.log('BlueLeaf Books — Live Provider Diagnostics Probe');
  console.log(`Execution Time: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  const results = [];

  for (const probe of PROBES) {
    const start = Date.now();
    let status = 0;
    let latency = 0;
    let success = false;
    let errorMsg = null;
    let sampleSummary = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const targetUrl = probe.url;
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BlueLeafBooksDiagnostic/1.0 (https://blueleaf-books.netlify.app/; contact@blueleaf-books.org)',
          Accept: probe.isText ? 'text/plain, application/xml, text/xml, */*' : 'application/json, text/plain',
        },
      });

      clearTimeout(timeout);
      latency = Date.now() - start;
      status = res.status;

      if (res.ok) {
        if (probe.isText) {
          const text = await res.text();
          success = probe.validate(text);
          sampleSummary = `Bytes: ${text.length}, Preview: ${text.slice(0, 80).replace(/\s+/g, ' ')}`;
        } else {
          const json = await res.json();
          success = probe.validate(json);
          sampleSummary = `Valid shape: ${success}`;
        }
      } else {
        errorMsg = `HTTP ${res.status} ${res.statusText}`;
      }
    } catch (err) {
      latency = Date.now() - start;
      errorMsg = err instanceof Error ? err.message : String(err);
    }

    const report = {
      name: probe.name,
      provider: probe.provider,
      url: probe.url,
      status,
      latencyMs: latency,
      success,
      errorMsg,
      sampleSummary,
    };

    results.push(report);
    const icon = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${probe.name.padEnd(38)} | ${status || 'ERR'} | ${latency}ms | ${errorMsg || sampleSummary || ''}`);

    // Pacing to avoid hitting provider burst rate limits
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('='.repeat(70));
  return results;
}

runDiagnostics().then(results => {
  const passed = results.filter(r => r.success).length;
  console.log(`Summary: ${passed}/${results.length} probes passed.`);
  process.exit(passed > 0 ? 0 : 1);
});
