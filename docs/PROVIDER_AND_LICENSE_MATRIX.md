# BlueLeaf Books — Provider & License Matrix

This document defines the technical integration specifications, licensing rights, attribution rules, and access constraints for each integrated data provider.

---

## 1. Integrated Provider Specifications

### 1. Project Gutenberg (via Gutendex & First-Party Proxy)
* **Discovery API:** Gutendex (`https://gutendex.com/books/?search={q}`, `https://gutendex.com/books/?topic={subject}`)
* **Content Source:** `https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt`
* **Proxy Architecture:** Routed through same-origin rewrite `/api/gutenberg/*` in `netlify.toml`.
* **Formats Supported:** UTF-8 Plain Text, ISO-8859-1 Plain Text, HTML, EPUB.
* **Licensing / Rights:** Public Domain in the United States. Titles published prior to 1929 or with lapsed copyright.
* **Attribution Required:** "Project Gutenberg" (displayed on book details and reader toolbar).
* **Caching Allowed:** Yes, plain text may be stored locally in IndexedDB for offline reading.
* **Access Policy:** Follows Project Gutenberg robot harvesting guidelines; requests cached with 1-hour TTL.

### 2. Internet Archive
* **Discovery API:** Advanced Search API (`https://archive.org/advancedsearch.php`)
* **Metadata API:** `https://archive.org/metadata/{identifier}`
* **Reading Routes:**
  * In-app OCR Plain Text: `https://archive.org/stream/{identifier}/{identifier}_djvu.txt`
  * Embedded BookReader: `https://archive.org/embed/{identifier}` (sandboxed iframe permitted by CSP)
* **Licensing / Rights:** Item-level rights metadata (`licenseurl`), Creative Commons, or Public Domain.
* **Attribution Required:** "Internet Archive Digital Library".
* **Caching Allowed:** Only for items with verified public-domain or CC licenses. Controlled lending items are never cached offline.
* **Access Policy:** Rate-limited; respects borrowing/login access states.

### 3. Wikisource (Wikimedia Foundation)
* **Discovery API:** MediaWiki Action API (`https://en.wikisource.org/w/api.php?action=query&list=search`)
* **Content Route:** `https://en.wikisource.org/w/api.php?action=parse&page={title}&prop=text`
* **Formats Supported:** Cleaned semantic plain text, HTML parse.
* **CORS Support:** Native `origin=*` supported on all MediaWiki endpoints. No third-party proxy required.
* **Licensing / Rights:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) and Public Domain.
* **Attribution Required:** "Wikisource, a Wikimedia project" with link to page history/source.
* **Caching Allowed:** Yes, with CC BY-SA 4.0 attribution preserved.

### 4. Standard Ebooks
* **Discovery Route:** Public New Releases Atom Feed (`https://standardebooks.org/feeds/atom/new-releases`)
* **Content Route:** Single-page web edition (`https://standardebooks.org/ebooks/{slug}/text/single-page`) and public domain EPUB.
* **Formats Supported:** Clean typography, EPUB, Web HTML.
* **Licensing / Rights:** Public Domain (CC0 1.0 Universal dedication for editorial work; underlying works in public domain).
* **Attribution Required:** "Standard Ebooks, volunteer-driven public domain typography".
* **Caching Allowed:** Yes, public domain worldwide.

### 5. Open Library (Internet Archive)
* **Discovery API:** Search API (`https://openlibrary.org/search.json`), Works API (`https://openlibrary.org/works/{id}.json`)
* **Reading Route:**
  * Public items: Delegates to Internet Archive `iaId` text or embed.
  * Borrowable items: Official Controlled Digital Lending link (`https://openlibrary.org/borrow/...`).
* **Licensing / Rights:** Open bibliographic metadata; underlying books vary between public domain and copyrighted library editions.
* **Attribution Required:** "Open Library, an initiative of the Internet Archive".
* **Caching Allowed:** Metadata only. Controlled lending books are never cached offline.

---

## 2. Reading Capability Classification

| Capability | UI Badge | Primary Action | Target Route |
| :--- | :--- | :--- | :--- |
| **`FULL_TEXT`** | Free to read | `Read` | BlueLeaf In-App Reader (with TOC & chunking) |
| **`OFFICIAL_EMBED`** | Official reader | `Read` | BlueLeaf Embedded IA Reader |
| **`BORROW_REQUIRED`** | Borrow on Open Library | `Borrow` | Open Library Controlled Digital Lending |
| **`EXTERNAL_READER`** | Official reader | `Read` | Provider Official Reader |
| **`METADATA_ONLY`** | Bibliographic record | `Details` | Book Detail view + Gutenberg twin search |
| **`UNAVAILABLE`** | Text unavailable | `Details` | Honest unavailable notice |
