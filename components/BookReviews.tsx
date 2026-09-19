"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import RatingBreakdown from "@/components/RatingBreakdown";
import { MessageSquarePlus, AlertCircle } from "lucide-react";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  title: string | null;
  body: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date | null;
  isEdited: boolean;
}

interface BookReviewsProps {
  bookId: string;
  bookTitle: string;
  userId?: string;
  reviews: Review[];
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
    average: number;
  };
  userReview: {
    id: string;
    rating: number;
    title: string | null;
    body: string;
  } | null;
  canReview: boolean;
  userVotes: string[];
}

const BookReviews = ({
  bookId,
  bookTitle,
  userId,
  reviews,
  breakdown,
  userReview,
  canReview,
  userVotes,
}: BookReviewsProps) => {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditReview = () => {
    setIsFormOpen(true);
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquarePlus className="w-7 h-7 text-primary" />
          Reviews & Ratings
        </h2>

        {/* Review button */}
        {userId && canReview && !userReview && !isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-3 bg-primary text-dark-100 font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      <div className="mb-6">
        <RatingBreakdown breakdown={breakdown} />
      </div>

      {/* Review form */}
      {isFormOpen && userId && (
        <div className="mb-6">
          <ReviewForm
            userId={userId}
            bookId={bookId}
            bookTitle={bookTitle}
            existingReview={userReview}
            onClose={() => setIsFormOpen(false)}
          />
        </div>
      )}

      {/* Not eligible notice */}
      {userId && !canReview && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium text-sm">
              Verified Reviews Only
            </p>
            <p className="text-yellow-300/80 text-xs mt-1">
              You can only review books you&apos;ve borrowed. Borrow this book
              to share your thoughts!
            </p>
          </div>
        </div>
      )}

      {/* Review list */}
      <ReviewList
        reviews={reviews}
        currentUserId={userId}
        userVotes={userVotes}
        onEditReview={handleEditReview}
      />
    </section>
  );
};

export default BookReviews;