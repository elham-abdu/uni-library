"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createReview } from "@/lib/actions/review";
import StarRating from "@/components/StarRating";
import { X, Send, Loader2 } from "lucide-react";

interface ReviewFormProps {
  userId: string;
  bookId: string;
  bookTitle: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string | null;
    body: string;
  } | null;
  onClose?: () => void;
}

const ReviewForm = ({
  userId,
  bookId,
  bookTitle,
  existingReview,
  onClose,
}: ReviewFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [body, setBody] = useState(existingReview?.body || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (body.trim().length < 10) {
      toast.error("Review must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await createReview({
        userId,
        bookId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });

      if (result.success) {
        toast.success(result.message || "Review posted!");
        router.refresh();
        onClose?.();
      } else {
        toast.error(result.error || "Failed to submit review.");
      }
    });
  };

  return (
    <div className="bg-dark-200 border border-dark-300 rounded-2xl p-6 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-light-200 hover:text-white hover:bg-dark-400 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <h3 className="text-lg font-semibold text-white mb-1">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>
      <p className="text-light-100 text-sm mb-5">
        Share your thoughts on <span className="text-primary">{bookTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="text-light-100 text-sm block mb-2 font-medium">
            Your Rating <span className="text-red-400">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Title */}
        <div>
          <label className="text-light-100 text-sm block mb-2 font-medium">
            Review Title <span className="text-light-200">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Sum up your review in one line"
            className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-light-200 focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-light-200 text-xs mt-1 text-right">
            {title.length}/200
          </p>
        </div>

        {/* Body */}
        <div>
          <label className="text-light-100 text-sm block mb-2 font-medium">
            Your Review <span className="text-red-400">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="What did you think about this book? What stood out?"
            className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-xl text-white placeholder-light-200 focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <p className="text-light-200 text-xs mt-1 text-right">
            {body.length}/2000
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-dark-300 text-light-100 rounded-xl hover:bg-dark-400 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || rating === 0 || body.trim().length < 10}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-dark-100 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {existingReview ? "Update Review" : "Post Review"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;