import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  color: string;
  cover: string;
  videoUrl?: string;
  summary?: string;
  isLoanedBook?: boolean;
}

const BookOverview = ({
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  color,
  cover,
}: Props) => {
  return (
    <section className="book-overview">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>

        <div className="book-info">
          <p> 
            By <span className="font-semibold text-light-200">{author}</span>
          </p>

          <p>
            Category:{' '}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={22} height={22} />
            <p>{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books: <span>{totalCopies}</span>
          </p>

          <p>
            Available Books: <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description">{description}</p>

        <Button className="book-overview_btn">
          <Image src="/icons/book.svg" alt="book" width={20} height={20} />
          <p className="font-bebas-neue text-xl text-dark-100">Borrow Book</p>
        </Button>
      </div>

      <div className="relative flex flex-1 justify-center">
        <div className="relative">
          {/* Main Book Cover */}
          <div
            className="book-cover_wide z-10 relative overflow-hidden rounded-r-md"
            style={{ backgroundColor: color }}
          >
            <Image
              src={cover}
              alt={title}
              fill
              className="object-fill rounded-r-md"
            />
          </div>

          {/* Decorative Backing Cover */}
          <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
            <div
              className="book-cover_wide relative overflow-hidden rounded-r-md"
              style={{ backgroundColor: color }}
            >
              <Image
                src={cover}
                alt={title}
                fill
                className="object-fill rounded-r-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;