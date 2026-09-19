import React from "react";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import { BorrowBook } from "@/components/BorrowBook";
import HoldButton from "@/components/HoldButton";
import ReadingListButton from "@/components/ReadingListButton";

interface BookOverviewProps {
  id: string | number;
  title: string;
  author?: string;
  genre: string;
  rating?: number | string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  coverColor: string;
  coverUrl?: string;
  userId: string;
  summary?: string;
  existingHold?: {
    id: string;
    queuePosition: number;
  } | null;
  readingListStatus?: "WANT_TO_READ" | "CURRENTLY_READING" | "FINISHED" | null;
}

const BookOverview = ({
  id,
  title,
  author,
  genre,
  rating,
  totalCopies = 0,
  availableCopies = 0,
  description,
  coverColor,
  coverUrl,
  userId,
  existingHold,
  readingListStatus,
}: BookOverviewProps) => {
  const borrowEligibility = {
    isEligible: availableCopies > 0,
    message: availableCopies <= 0 ? "Book is currently out of stock" : "",
  };

  return (
    <section className="book-overview">
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

        {/* Borrow Button */}
        <BorrowBook
          bookId={String(id)}
          userId={userId}
          borrowEligibility={borrowEligibility}
        />

        {/* Hold Button (only shows when out of stock) */}
        <HoldButton
          userId={userId}
          bookId={String(id)}
          availableCopies={availableCopies}
          existingHold={existingHold}
        />

        {/* ✅ Reading List Button */}
        {userId && (
          <ReadingListButton
            userId={userId}
            bookId={String(id)}
            currentStatus={readingListStatus}
          />
        )}
      </div>

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