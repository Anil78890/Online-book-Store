# BlueLeaf Books — Genre & Subject Coverage Matrix

This document defines the centralized genre taxonomy implemented in `src/services/books/genres.ts` and maps each genre to the exact vocabulary used by each book provider.

---

## 1. Centralized Genre Taxonomy

BlueLeaf Books replaces the earlier 6 hardcoded categories with 15 verified curated literary and academic subject areas:

| # | Genre ID | Display Name | Gutendex Query | Open Library Query | Internet Archive Query | Wikisource Query | Standard Ebooks |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `classics` | Literary Fiction & Classics | `classic_literature` | `classic_literature` | `classic literature` | `Classics` | `fiction` |
| **2** | `adventure` | Adventure & Travel | `adventure` | `adventure_and_adventurers` | `adventure travel expeditions` | `Adventure` | `adventure` |
| **3** | `philosophy` | Philosophy & Ethics | `philosophy` | `philosophy` | `philosophy ethics logic` | `Philosophy` | `philosophy` |
| **4** | `science-fiction` | Science Fiction | `science_fiction` | `science_fiction` | `science fiction fantasy` | `Science fiction` | `science-fiction` |
| **5** | `mystery` | Mystery & Detective | `detective_and_mystery_stories` | `detective_and_mystery_stories` | `detective mystery crime` | `Detective fiction` | `mystery` |
| **6** | `history` | History & Documents | `history` | `history` | `world history civilization documents` | `History` | `history` |
| **7** | `romance` | Romance & Relationships | `love_stories` | `romance` | `romance courtship stories` | `Romance` | `romance` |
| **8** | `horror` | Horror & Gothic | `horror` | `gothic_fiction` | `gothic horror supernatural tales` | `Horror` | `horror` |
| **9** | `poetry` | Poetry & Verse | `poetry` | `poetry` | `poetry verse sonnets` | `Poetry` | `poetry` |
| **10** | `drama` | Drama & Plays | `drama` | `drama` | `drama plays theatre tragedy` | `Drama` | `drama` |
| **11** | `children` | Children's & Folklore | `children` | `juvenile_fiction` | `fairy tales folklore children` | `Children` | `childrens` |
| **12** | `biography` | Biography & Memoir | `biography` | `biography` | `biography autobiography memoirs` | `Biography` | `biography` |
| **13** | `science-nature` | Science & Nature | `science` | `science` | `natural history science biology astronomy` | `Science` | `science` |
| **14** | `economics-politics` | Economics, Law & Civics | `economics` | `political_science` | `political theory economics constitution law` | `Politics` | `nonfiction` |
| **15** | `mythology` | Mythology & Sacred Texts | `mythology` | `mythology` | `mythology folklore ancient sacred texts` | `Mythology` | `nonfiction` |

---

## 2. Integration and UX Highlights

1. **Centralized Registry:** All genre queries and definitions reside in `src/services/books/genres.ts` rather than hardcoded arrays in components.
2. **Provider Vocabulary Normalization:** `getGenreQueryForProvider(genreId, provider)` dynamically maps the generic slug to the specific provider's taxonomy.
3. **No Card Grids:** Featured and genre lists maintain a text-first, compact list row presentation (`BookListItem`).
4. **Interactive Filters:** The search page (`/search`) allows single-click genre filtering with a "Clear genre" badge.
5. **No Invented Counts:** BlueLeaf Books only displays counts returned by the live providers; when unavailable, it presents "Browse results" or the actual count loaded.
