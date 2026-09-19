"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  toggleHelpfulVote,
  deleteReview,
} from "@/lib/actions/review";
import StarRating from "@/components/StarRating";
import {
  ThumbsUp,
  Trash2,
  Edit2,
  CheckCircle,
  Loader2,
} from "lucide-react";

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
  isEdited: boolean | null; // ✅ Allow null
}
interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  userVotes?: string[];
  onEditReview?: (review: Review) => void;
}

const ReviewList = ({
  reviews,
  currentUserId,
  userVotes = [],
  onEditReview,
}: ReviewListProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [votedReviews, setVotedReviews] = useState<string[]>(userVotes);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleVote = (reviewId: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to vote.");
      return;
    }

    if (votedReviews.includes(reviewId)) {
      toast.info("You already voted this as helpful.");
      return;
    }

    setVotingId(reviewId);
    startTransition(async () => {
      const result = await toggleHelpfulVote({
        reviewId,
        userId: currentUserId,
      });

      if (result.success) {
        setVotedReviews((prev) => [...prev, reviewId]);
        toast.success("Marked as helpful!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to vote.");
      }
      setVotingId(null);
    });
  };

  const handleDelete = (reviewId: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;

    setDeletingId(reviewId);
    startTransition(async () => {
      const result = await deleteReview({
        reviewId,
        userId: currentUserId!,
      });

      if (result.success) {
        toast.success("Review deleted.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete.");
      }
      setDeletingId(null);
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-200 rounded-2xl border border-dark-300">
        <p className="text-light-100">
          No reviews yet. Be the first to review this book!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwnReview = review.userId === currentUserId;
        const hasVoted = votedReviews.includes(review.id);

        return (
          <div
            key={review.id}
            className="bg-dark-200 border border-dark-300 rounded-2xl p-5 hover:border-dark-400 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">
                      {review.userName}
                    </p>
                    {isOwnReview && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-light-200 text-xs">
                    {formatDate(review.createdAt)}
                    {review.isEdited && (
                      <span className="ml-2 text-light-200/70">· Edited</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <StarRating value={review.rating} size="sm" readonly />
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="text-white font-semibold mb-2">
                {review.title}
              </h4>
            )}

            {/* Body */}
            <p className="text-light-100 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
              {review.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-dark-300/50">
              {/* Helpful button */}
              <button
                onClick={() => handleVote(review.id)}
                disabled={votingId === review.id || hasVoted}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  hasVoted
                    ? "bg-green-500/10 text-green-400 cursor-default"
                    : "bg-dark-300 text-light-100 hover:bg-dark-400 hover:text-white"
                } disabled:opacity-50`}
              >
                {votingId === review.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasVoted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                <span>
                  Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                </span>
              </button>

              {/* Own review actions */}
              {isOwnReview && (
                <div className="flex gap-2">
                  {onEditReview && (
                    <button
                      onClick={() => onEditReview(review)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-300 text-light-100 rounded-lg text-sm hover:bg-dark-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === review.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;