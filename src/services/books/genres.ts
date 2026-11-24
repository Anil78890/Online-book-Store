import type { BookSource } from '../../types/book';

export interface GenreCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  queries: {
    gutendex: string;
    openlibrary: string;
    internetarchive: string;
    wikisource: string;
    standardebooks: string;
  };
}

export const GENRE_TAXONOMY: GenreCategory[] = [
  {
    id: 'classics',
    name: 'Literary Fiction & Classics',
    description: 'Timeless masterpieces and foundational literature from world authors.',
    icon: 'BookOpen',
    queries: {
      gutendex: 'classic_literature',
      openlibrary: 'classic_literature',
      internetarchive: 'classic literature',
      wikisource: 'Classics',
      standardebooks: 'fiction',
    },
  },
  {
    id: 'adventure',
    name: 'Adventure & Travel',
    description: 'Expeditions, maritime journeys, and narratives of exploration and discovery.',
    icon: 'Compass',
    queries: {
      gutendex: 'adventure',
      openlibrary: 'adventure_and_adventurers',
      internetarchive: 'adventure travel expeditions',
      wikisource: 'Adventure',
      standardebooks: 'adventure',
    },
  },
  {
    id: 'philosophy',
    name: 'Philosophy & Ethics',
    description: 'Fundamental inquiries into existence, reason, virtue, and knowledge.',
    icon: 'Brain',
    queries: {
      gutendex: 'philosophy',
      openlibrary: 'philosophy',
      internetarchive: 'philosophy ethics logic',
      wikisource: 'Philosophy',
      standardebooks: 'philosophy',
    },
  },
  {
    id: 'science-fiction',
    name: 'Science Fiction',
    description: 'Speculative futures, space voyages, and pioneering technological imagination.',
    icon: 'Rocket',
    queries: {
      gutendex: 'science_fiction',
      openlibrary: 'science_fiction',
      internetarchive: 'science fiction fantasy',
      wikisource: 'Science fiction',
      standardebooks: 'science-fiction',
    },
  },
  {
    id: 'mystery',
    name: 'Mystery & Detective',
    description: 'Deductive tales, puzzles, suspenseful investigations, and crime fiction.',
    icon: 'Search',
    queries: {
      gutendex: 'detective_and_mystery_stories',
      openlibrary: 'detective_and_mystery_stories',
      internetarchive: 'detective mystery crime',
      wikisource: 'Detective fiction',
      standardebooks: 'mystery',
    },
  },
  {
    id: 'history',
    name: 'History & Documents',
    description: 'Historical records, ancient chronicles, and documents that shaped civilizations.',
    icon: 'Landmark',
    queries: {
      gutendex: 'history',
      openlibrary: 'history',
      internetarchive: 'world history civilization documents',
      wikisource: 'History',
      standardebooks: 'history',
    },
  },
  {
    id: 'romance',
    name: 'Romance & Relationships',
    description: 'Stories of affection, societal courtship, emotional bonds, and devotion.',
    icon: 'Heart',
    queries: {
      gutendex: 'love_stories',
      openlibrary: 'romance',
      internetarchive: 'romance courtship stories',
      wikisource: 'Romance',
      standardebooks: 'romance',
    },
  },
  {
    id: 'horror',
    name: 'Horror & Gothic',
    description: 'Eerie, supernatural, psychological terror, and classic gothic tales.',
    icon: 'Skull',
    queries: {
      gutendex: 'horror',
      openlibrary: 'gothic_fiction',
      internetarchive: 'gothic horror supernatural tales',
      wikisource: 'Horror',
      standardebooks: 'horror',
    },
  },
  {
    id: 'poetry',
    name: 'Poetry & Verse',
    description: 'Lyric poetry, sonnets, epic verses, and rhythmic reflections.',
    icon: 'Feather',
    queries: {
      gutendex: 'poetry',
      openlibrary: 'poetry',
      internetarchive: 'poetry verse sonnets',
      wikisource: 'Poetry',
      standardebooks: 'poetry',
    },
  },
  {
    id: 'drama',
    name: 'Drama & Plays',
    description: 'Theatrical works, tragedies, comedies, and dialogues for the stage.',
    icon: 'Theater',
    queries: {
      gutendex: 'drama',
      openlibrary: 'drama',
      internetarchive: 'drama plays theatre tragedy',
      wikisource: 'Drama',
      standardebooks: 'drama',
    },
  },
  {
    id: 'children',
    name: "Children's Literature & Folklore",
    description: 'Fairy tales, fables, and stories inspiring youthful wonder and imagination.',
    icon: 'Sparkles',
    queries: {
      gutendex: 'children',
      openlibrary: 'juvenile_fiction',
      internetarchive: 'fairy tales folklore children',
      wikisource: 'Children',
      standardebooks: 'childrens',
    },
  },
  {
    id: 'biography',
    name: 'Biography & Memoir',
    description: 'Firsthand accounts, personal memoirs, and authoritative life studies.',
    icon: 'UserCheck',
    queries: {
      gutendex: 'biography',
      openlibrary: 'biography',
      internetarchive: 'biography autobiography memoirs',
      wikisource: 'Biography',
      standardebooks: 'biography',
    },
  },
  {
    id: 'science-nature',
    name: 'Science & Natural History',
    description: 'Observational biology, geology, cosmology, and the history of scientific inquiry.',
    icon: 'Microscope',
    queries: {
      gutendex: 'science',
      openlibrary: 'science',
      internetarchive: 'natural history science biology astronomy',
      wikisource: 'Science',
      standardebooks: 'science',
    },
  },
  {
    id: 'economics-politics',
    name: 'Economics, Law & Civics',
    description: 'Political theory, jurisprudence, constitutional writings, and economic philosophy.',
    icon: 'Scale',
    queries: {
      gutendex: 'economics',
      openlibrary: 'political_science',
      internetarchive: 'political theory economics constitution law',
      wikisource: 'Politics',
      standardebooks: 'nonfiction',
    },
  },
  {
    id: 'mythology',
    name: 'Mythology & Sacred Texts',
    description: 'Classical mythology, legends, ancient lore, and foundational spiritual writings.',
    icon: 'Flame',
    queries: {
      gutendex: 'mythology',
      openlibrary: 'mythology',
      internetarchive: 'mythology folklore ancient sacred texts',
      wikisource: 'Mythology',
      standardebooks: 'nonfiction',
    },
  },
];

export const getGenreById = (id: string): GenreCategory | undefined => {
  const normId = id.toLowerCase().replace(/_/g, '-');
  return GENRE_TAXONOMY.find(g => g.id === normId || g.id === id);
};

export const getGenreQueryForProvider = (genreId: string, provider: BookSource): string => {
  const genre = getGenreById(genreId);
  if (!genre) return genreId;
  return genre.queries[provider] || genreId;
};
