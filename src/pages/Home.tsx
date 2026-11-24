import type { Book } from '../types/book';
import CategoryTiles from '../components/CategoryTiles';
import FeaturedBooks from '../components/FeaturedBooks';
import FeaturedFreeReads from '../components/FeaturedFreeReads';
import HeroSection from '../components/HeroSection';
import SocialProof from '../components/SocialProof';
import ValueBar from '../components/ValueBar';
import WhyChooseUs from '../components/WhyChooseUs';

interface HomeProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

/**
 * Lightweight, accessible homepage:
 * - Above-the-fold: Hero, ValueBar, Featured reader favourites (list rows).
 * - CategoryTiles for direct topic exploration.
 * - Below-the-fold FeaturedFreeReads: lazy-loaded on viewport intersection to prevent initial network storms.
 * - Factual platform commitments (SocialProof) and WhyChooseUs.
 * - 100% list row catalogue—zero card grids or horizontal carousels.
 */
const Home = ({ onSaveBook, isBookSaved }: HomeProps) => (
  <main>
    <HeroSection />
    <ValueBar />
    <FeaturedBooks onSaveBook={onSaveBook} isBookSaved={isBookSaved} />
    <CategoryTiles />
    <FeaturedFreeReads onSaveBook={onSaveBook} isBookSaved={isBookSaved} />
    <SocialProof />
    <WhyChooseUs />
  </main>
);

export default Home;
