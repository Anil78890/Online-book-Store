# BlueLeaf Books — Project Briefing Summary

## 1. Product & Core Purpose
BlueLeaf Books is a white-labeled web application. Its single core purpose is to provide a seamless, distraction-free reading experience for public domain books (sourced from Gutendex and Open Library) directly within the browser, completely removing external redirects and commerce features.

## 2. Current State vs. Target State
- **Current State:** The app relies on external links for reading, suffers from broken text loading due to CORS restrictions, and includes unnecessary commerce UI.
- **Target State:** A robust, offline-capable Progressive Web App (PWA) with built-in reading capabilities, custom typography controls, Text-to-Speech, and a premium design system.

## 3. Most Important Changes (Priority Order)
1. **Core Reading Experience:** Implement in-app reading and remove all external links and commerce elements.
2. **Data Foundation:** Create a centralized API service layer and a canonical `Book` data type.
3. **Reader Superpowers:** Implement offline support via IndexedDB, Text-to-Speech, typography adjustments, and private analytics.
4. **UI Enhancements:** Apply a cohesive design system with micro-interactions, responsive layouts, and cover fallbacks.
5. **Launch Hardening:** Add trust pages, SEO metadata, and ensure full accessibility.

## 4. Critical Blocker: The CORS Issue
Project Gutenberg servers omit the `Access-Control-Allow-Origin` header, blocking direct browser text fetching. 

**The Fix:** A resilient content pipeline must be implemented.
- First, check an IndexedDB cache.
- Then, route requests through a serverless/edge proxy (or Vite proxy locally) to bypass CORS.
- Follow up with a chain of public CORS proxies as a fallback.
- Finally, cache the result or gracefully fail without leaving the app.

---
*Note: This summary is based on the authoritative `WEBSITE_OWNERSHIP_RECOMMENDATIONS.md` build spec.*
