# BlueLeaf Books — Live Provider Diagnostic Report

**Date of Diagnostic Probe:** 2026-11-24  
**Environment:** Windows Node.js v24.15.0 / Vite 5 / Local Dev Preview  
**Diagnostic Script:** `npm run diagnose:providers` (`scripts/diagnose-providers.mjs`)  

---

## 1. Executive Summary

This diagnostic report documents the empirical audit of live endpoints across all integrated book providers for BlueLeaf Books. Each provider was probed directly to verify response shapes, HTTP statuses, measured latency, CORS headers, access policies, format availability, and error modes.

---

## 2. Empirical Probe Results

| Probe Name | Provider | Endpoint Pattern | Status | Latency | Result Summary |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Gutendex Search** | Project Gutenberg | `https://gutendex.com/books/?search={q}` | `200 OK` | ~828ms | Valid JSON, returns `count`, `results` array with IDs, titles, and `formats` map. |
| **Gutendex Category** | Project Gutenberg | `https://gutendex.com/books/?topic={topic}` | `200 OK` | ~717ms | Valid JSON, returns public-domain records for requested subject. |
| **Gutenberg Direct Text** | Project Gutenberg | `https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt` | `503 Service Unavailable` | ~1455ms | **Blocked by robot policy** on direct programmatic requests without browser headers or Netlify proxy. |
| **Open Library Search API** | Open Library | `https://openlibrary.org/search.json?q={q}&fields=...` | `200 OK` | ~2229ms | Valid JSON, returns `docs` with `ia`, `ebook_access`, `has_fulltext`. |
| **Open Library Subjects API** | Open Library | `https://openlibrary.org/subjects/{subject}.json` | `200 OK` | ~4221ms | High latency (~4.2s), returns `works` with cover IDs and author lists. |
| **Internet Archive Advanced Search** | Internet Archive | `https://archive.org/advancedsearch.php?q=...&output=json` | `200 OK` | ~1253ms | Valid JSON, returns public domain texts with `identifier`, `creator`, `publicdate`. |
| **Internet Archive Metadata API** | Internet Archive | `https://archive.org/metadata/{id}` | `200 OK` | ~2677ms | Valid JSON, returns `metadata` and `files` array listing `_djvu.txt` and images. |
| **Wikisource Search API** | Wikisource | `https://en.wikisource.org/w/api.php?action=query&list=search` | `200 OK` | ~949ms | Valid JSON, supports `origin=*` (no CORS proxy needed), returns page titles and snippets. |
| **Wikisource Parse Content** | Wikisource | `https://en.wikisource.org/w/api.php?action=parse&prop=text` | `200 OK` | ~707ms | Valid JSON, returns HTML content and section structure. |
| **Standard Ebooks Atom Feed** | Standard Ebooks | `https://standardebooks.org/feeds/atom/new-releases` | `200 OK` | ~1405ms | Valid Atom XML (61.7KB), contains curated public domain releases with EPUB and single-page text. |

---

## 3. Failure Root Causes & Fixes Implemented

### Failure Mode 1: Gutenberg Direct Text 503 / CORS Failure
* **Root Cause:** `gutenberg.org` rejects direct automated scripts and does not emit CORS `Access-Control-Allow-Origin` headers. In a browser client, calling `gutenberg.org` directly triggers a CORS error; from automated server scripts, it returns HTTP 503 due to its strict robot harvesting policies.
* **Fix Implemented:**
  1. Configured same-origin serverless rewrite in `netlify.toml`: `/api/gutenberg/*` -> `https://www.gutenberg.org/:splat`.
  2. In `src/services/books/content.ts`, implemented `toSameOriginProxyUrl()` with safe regex path allowlisting (`/cache/epub/...`, `/ebooks/...`) to avoid open proxy vulnerabilities.
  3. Removed reliance on untrusted third-party public CORS proxies (`corsproxy.io`, `api.allorigins.win`).

### Failure Mode 2: Open Library Metadata Treated as Readable Book Content
* **Root Cause:** Previously, when a search returned an Open Library record, the work's web page was assigned to `formats.html` and marked `metadata-only`, but if no Gutenberg twin was found, the reader showed book descriptions or title metadata as if it were the book's text.
* **Fix Implemented:**
  1. Created explicit `ReadingCapability`: `FULL_TEXT`, `BORROW_REQUIRED`, `OFFICIAL_EMBED`, `EXTERNAL_READER`, `METADATA_ONLY`, `UNAVAILABLE`.
  2. Inspected Open Library `ebook_access` and `ia`:
     * When `ebook_access === 'public'` and `ia` is present, it is mapped to in-app or embedded reading.
     * When `ebook_access === 'borrowable'`, it is mapped to `BORROW_REQUIRED` with a legitimate borrow link.
     * When `ebook_access === 'no_ebook'`, it is strictly mapped to `METADATA_ONLY` with an honest message explaining that full text is unavailable.
  3. The in-app reader never displays book descriptions as book text.

### Failure Mode 3: Provider Latency Blocking (Open Library taking >4s)
* **Root Cause:** Serial `Promise.all` waiting for Open Library caused searches to hang until the slowest API returned.
* **Fix Implemented:**
  1. Implemented `settleBooks()` progressive streaming: Gutendex, Wikisource, and Internet Archive results render immediately as soon as each resolves.
  2. Bounded per-request timeouts (7s) and TTL request deduplication caching.

---

## 4. Format Availability Matrix

| Provider | In-App Plain Text | In-App HTML | Scanned BookReader | External Lending | Metadata Only |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Project Gutenberg** | ✅ Yes (`pg{id}.txt`) | ✅ Yes | ❌ N/A | ❌ N/A | When only audio |
| **Internet Archive** | ✅ Yes (`_djvu.txt`) | ❌ N/A | ✅ Yes (Official Embed) | ✅ Controlled Lending | ❌ Rare |
| **Wikisource** | ✅ Cleaned Parse | ✅ Sanitized | ❌ N/A | ❌ N/A | Index pages |
| **Standard Ebooks** | ✅ Single-Page | ✅ Yes | ❌ N/A | ❌ N/A | ❌ N/A |
| **Open Library** | Via Public IA | ❌ N/A | Via IA Embed | ✅ Borrow on OL | ✅ Copyrighted works |
