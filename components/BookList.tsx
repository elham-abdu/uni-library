import React from "react";
import BookCard from "@/components/BookCard";

interface Book {
  id: string | number;
  title: string;
  author?: string;
  genre: string;
  rating?: number | string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  coverColor: string;
  color?: string;
  cover?: string;
  coverUrl?: string;
  videoUrl?: string;
  summary?: string;
  createdAt?: Date | null;
  isLoanedBook?: boolean;
}

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
}

const BookList = ({ title, books, containerClassName }: Props) => {
  console.log("=== BOOKLIST DEBUG ===");
  console.log("Title:", title);
  console.log("Books received:", books?.length || 0);
  console.log("Books data:", books);

  if (!books || books.length === 0) {
    return (
      <section className={containerClassName}>
        <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>
        <p className="text-light-100 mt-4">No books available at the moment.</p>
      </section>
    );
  }

  return (
    <section className={containerClassName}>
      <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>

      <ul className="book-list mt-10 flex flex-wrap gap-5 xs:gap-10 max-xs:justify-between">
        {books.map((book) => {
          console.log("Rendering book:", book.title);
          return <BookCard key={book.id} {...book} />;
        })}
      </ul>
    </section>
  );
};

export default BookList;