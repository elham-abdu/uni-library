import React from "react";
import Link from "next/link";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookCardProps {
  id?: string | number;
  title: string;
  genre: string;
  color?: string;
  coverColor?: string;
  cover?: string;
  coverUrl?: string;
  isLoanedBook?: boolean;
  rating?: number | string;
  author?: string;
}

const BookCard = ({
  id,
  title,
  genre,
  color,
  coverColor,
  cover,
  coverUrl,
  isLoanedBook = false,
}: BookCardProps) => {
  const bookHref = id ? `/books/${id}` : "#";

  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={bookHref}
        className={cn(isLoanedBook && "w-full flex flex-col items-center")}
      >
        <BookCover
          coverColor={color || coverColor || "#012B48"}
          coverImage={coverUrl || cover || ""}
        />

        <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
          <p className="book-title">{title}</p>
          <p className="book-genre">{genre}</p>
        </div>

        {isLoanedBook && (
          <div className="mt-3 w-full">
            <div className="book-loaned flex items-center gap-2">
              <Image
                src="/icons/calendar.svg"
                alt="calendar"
                width={18}
                height={18}
                className="object-contain"
              />
              <p className="text-light-100 text-sm">11 days left to return</p>
            </div>

            <Button className="book-btn bg-dark-600 mt-3 min-h-14 w-full text-base font-semibold text-light-100 uppercase">
              Download receipt
            </Button>
          </div>
        )}
      </Link>
    </li>
  );
};

export default BookCard;