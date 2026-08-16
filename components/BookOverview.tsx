import React from "react";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import { BorrowBook } from "@/components/BorrowBook";
import { Book } from "@/database/schema";

interface Props extends Book {
  userId: string;
}

const BookOverview = ({
  id,
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  userId,
}: Props) => {
  const borrowEligibility = {
    isEligible: availableCopies > 0,
    message: availableCopies <= 0 ? "Book is currently out of stock" : "",
  };

  return (
    <section className="book-overview">
      {/* 1. Left Section: Details & Borrow Button */}
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-5xl font-semibold text-white lg:text-7xl">
          {title}
        </h1>

        <div className="book-info">
          <p>
            By <span className="font-semibold text-light-200">{author}</span>
          </p>

          <p>
            Category:{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex flex-row items-center gap-1">
            <Image src="/icons/star.svg" alt="star" width={22} height={22} />
            <p>{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books <span>{totalCopies}</span>
          </p>

          <p>
            Available Books <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description">{description}</p>

        {/* 🌟 Interactive Borrow Button 🌟 */}
        <BorrowBook
          bookId={id}
          userId={userId}
          borrowEligibility={borrowEligibility}
        />
      </div>

      {/* 2. Right Section: Book Cover Graphics */}
      <div className="relative flex flex-1 justify-center">
        <div className="relative">
          <BookCover
            variant="wide"
            className="z-10"
            coverColor={coverColor}
            coverImage={coverUrl}
          />

          <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
            <BookCover
              variant="wide"
              coverColor={coverColor}
              coverImage={coverUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;