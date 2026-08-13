import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import BookCoverSvg from '@/components/BookCoverSvg';

type BookCoverVariant = "extraSmall" | "small" | "medium" | "regular" | "wide";

interface Props {
  coverImage?: string;
  className?: string;
  coverColor?: string;
  variant?: BookCoverVariant;
}

const variantStyles: Record<BookCoverVariant, string> = {
  extraSmall: "book-cover_extra_small",
  small: "book-cover_small",
  medium: "book-cover_medium",
  regular: "book-cover_regular",
  wide: "book-cover_wide",
};

const BookCover = ({ 
  variant = "regular", 
  className, 
  coverColor = "#012B48", 
  coverImage = "https://placehold.co/400x600.png" 
}: Props) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-300",
        variantStyles[variant],
        className
      )}
    > 
      <BookCoverSvg coverColor={coverColor} />

      <div
        className="absolute z-10"
        style={{ left: "12%", width: "87.5%", height: "88%" }}
      >
        <Image
          src={coverImage}
          alt="Book cover"
          fill
          className="rounded-sm object-fill"
        />
      </div>
    </div>
  );
};

export default BookCover;