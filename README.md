<div align="center">

# BlueLeaf Books

### A Modern Online Book Store

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4?logo=tailwindcss)

</div>

---

## About

**BlueLeaf Books** is a fully responsive online book store built with **React**, **TypeScript**, and **Tailwind CSS**. It fetches real books from **Project Gutenberg** and **Open Library**, allowing users to browse, search, and read thousands of free public domain books — all from a beautiful, modern UI.

---

## Features

- **Browse & Discover** — Featured books, trending carousel, deal of the day, and category tiles
- **Live Search** — Search across Project Gutenberg and Open Library simultaneously
- **In-Browser Reading** — Read full book content directly in the app with a customizable reader
- **Dark Mode Reader** — Toggle dark/light mode and adjust font size while reading
- **Shopping Cart** — Add books to cart, preview items, and manage your reading list
- **Share Books** — Share any book via native share or copy link
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Genre Filters** — Filter search results by Fiction, Non-Fiction, Romance, Adventure, Science, History, and Philosophy
- **Social Proof & Trust Sections** — Why Choose Us, Email Capture, and Value Bar components

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Styling |
| Lucide React | Icons |
| Gutendex API | Project Gutenberg books |
| Open Library API | Additional book catalog |

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9+) or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Anil78890/Online-book-Store.git

# 2. Navigate to the project directory
cd Online-book-Store

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
Online-book-Store/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation & cart preview
│   │   ├── HeroSection.tsx     # Landing hero with CTA
│   │   ├── FeaturedBooks.tsx   # Popular books grid
│   │   ├── CategoryTiles.tsx   # Genre category tiles
│   │   ├── TrendingCarousel.tsx # Horizontally scrollable carousel
│   │   ├── DealOfTheDay.tsx    # Daily deal section
│   │   ├── BookPage.tsx        # Full book reader view
│   │   ├── BookReader.tsx      # Book content renderer
│   │   ├── SearchResults.tsx   # Search & browse overlay
│   │   ├── CartPreview.tsx     # Cart dropdown
│   │   ├── StickyCart.tsx      # Mobile sticky cart button
│   │   ├── WhyChooseUs.tsx     # Trust / about section
│   │   ├── EmailCapture.tsx    # Newsletter signup
│   │   ├── SocialProof.tsx     # Social proof section
│   │   ├── ValueBar.tsx        # Value proposition bar
│   │   ├── Footer.tsx          # Site footer
│   │   └── WaveLogo.tsx        # Animated logo
│   ├── App.tsx                 # Root component & state management
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles & animations
│   └── vite-env.d.ts           # Vite type declarations
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── Dockerfile
```

---

## API Sources

All books are **free** and sourced from public domain libraries:

- **[Project Gutenberg](https://www.gutenberg.org/)** — via the [Gutendex API](https://gutendex.com/) — 70,000+ free eBooks
- **[Open Library](https://openlibrary.org/)** — millions of cataloged books with covers and metadata

---

## Deployment

### Netlify

The project includes a `netlify.toml` for one-click deployment:

```bash
npm run build
# Deploy the dist/ folder to Netlify
```

### Docker

```bash
docker build -t blueleaf-books .
docker run -p 3000:80 blueleaf-books
```

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## License

This project uses books from **Project Gutenberg** and **Open Library**, both of which provide free public domain content.

---

<div align="center">

**Built with care by [Anil78890](https://github.com/Anil78890)**

</div>
