import type { Book } from '../types/book';
import BookListItem from './BookListItem';

interface BookCardProps {
  book: Book;
  isSaved: boolean;
  onSave: (book: Book) => void;
}

/**
 * Card mode is deprecated in favour of accessible list rows throughout the catalogue.
 * This component delegates to BookListItem to prevent any card layout regressions.
 */
const BookCard = ({ book, isSaved, onSave }: BookCardProps) => (
  <BookListItem book={book} isSaved={isSaved} onSave={onSave} />
);

export default BookCard;
