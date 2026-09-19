"use server";

import { db } from "@/database/drizzle";
import {
  reviews,
  reviewVotes,
  borrowRecords,
  books,
  users,
} from "@/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CreateReviewParams {
  userId: string;
  bookId: string;
  rating: number;
  title?: string;
  body: string;
}

// ✅ Create or update a review
export const createReview = async (params: CreateReviewParams) => {
  const { userId, bookId, rating, title, body } = params;

  if (!userId || !bookId) {
    return { success: false, error: "User ID and Book ID are required." };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  if (!body || body.trim().length < 10) {
    return {
      success: false,
      error: "Review must be at least 10 characters.",
    };
  }

  try {
    const [hasBorrowed] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId)
        )
      )
      .limit(1);

    if (!hasBorrowed) {
      return {
        success: false,
        error: "You can only review books you've borrowed.",
      };
    }

    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
      .limit(1);

    if (existingReview) {
      const [updated] = await db
        .update(reviews)
        .set({
          rating,
          title: title?.trim() || null,
          body: body.trim(),
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existingReview.id))
        .returning();

      await updateBookRating(bookId);
      revalidatePath(`/books/${bookId}`);

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updated)),
        message: "Review updated!",
      };
    }

    const [newReview] = await db
      .insert(reviews)
      .values({
        userId,
        bookId,
        rating,
        title: title?.trim() || null,
        body: body.trim(),
      })
      .returning();

    await updateBookRating(bookId);
    revalidatePath(`/books/${bookId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newReview)),
      message: "Review posted!",
    };
  } catch (error) {
    console.error("Create Review Error:", error);
    return { success: false, error: "Failed to submit review." };
  }
};

// ✅ Delete a review
export const deleteReview = async (params: {
  reviewId: string;
  userId: string;
}) => {
  const { reviewId, userId } = params;

  try {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
      .limit(1);

    if (!review) {
      return { success: false, error: "Review not found." };
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    await updateBookRating(review.bookId);
    revalidatePath(`/books/${review.bookId}`);

    return { success: true, message: "Review deleted." };
  } catch (error) {
    console.error("Delete Review Error:", error);
    return { success: false, error: "Failed to delete review." };
  }
};

// ✅ Get all reviews for a book
export const getBookReviews = async (bookId: string) => {
  try {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.bookId, bookId))
      .orderBy(desc(reviews.helpfulCount), desc(reviews.createdAt));

    const formattedReviews = results.map((record) => {
      // ✅ Calculate isEdited safely
      let isEdited = false;
      if (record.reviews.updatedAt) {
        const updatedTime = new Date(record.reviews.updatedAt).getTime();
        const createdTime = new Date(record.reviews.createdAt).getTime();
        isEdited = updatedTime > createdTime + 1000;
      }

      return {
        id: record.reviews.id,
        userId: record.reviews.userId,
        userName: record.users.fullName,
        userInitials: record.users.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
        rating: record.reviews.rating,
        title: record.reviews.title,
        body: record.reviews.body,
        helpfulCount: record.reviews.helpfulCount,
        createdAt: record.reviews.createdAt,
        updatedAt: record.reviews.updatedAt,
        isEdited, // ✅ Always boolean
      };
    });

    return { success: true, data: formattedReviews };
  } catch (error) {
    console.error("Get Book Reviews Error:", error);
    return { success: false, error: "Failed to fetch reviews.", data: [] };
  }
};

// ✅ Get rating breakdown (5-star bars)
export const getRatingBreakdown = async (bookId: string) => {
  try {
    const result = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId))
      .groupBy(reviews.rating);

    const breakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      total: 0,
      average: 0,
    };

    result.forEach((row) => {
      breakdown[row.rating as 1 | 2 | 3 | 4 | 5] = row.count;
      breakdown.total += row.count;
    });

    if (breakdown.total > 0) {
      const sum =
        1 * breakdown[1] +
        2 * breakdown[2] +
        3 * breakdown[3] +
        4 * breakdown[4] +
        5 * breakdown[5];
      breakdown.average = parseFloat((sum / breakdown.total).toFixed(2));
    }

    return { success: true, data: breakdown };
  } catch (error) {
    console.error("Get Rating Breakdown Error:", error);
    return {
      success: false,
      data: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, average: 0 },
    };
  }
};

// ✅ Get user's review for a book
export const getUserReview = async (params: {
  userId: string;
  bookId: string;
}) => {
  const { userId, bookId } = params;

  try {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
      .limit(1);

    return { success: true, data: review || null };
  } catch (error) {
    console.error("Get User Review Error:", error);
    return { success: false, data: null };
  }
};

// ✅ Toggle helpful vote
export const toggleHelpfulVote = async (params: {
  reviewId: string;
  userId: string;
}) => {
  const { reviewId, userId } = params;

  try {
    const [existingVote] = await db
      .select()
      .from(reviewVotes)
      .where(
        and(
          eq(reviewVotes.reviewId, reviewId),
          eq(reviewVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote) {
      await db.delete(reviewVotes).where(eq(reviewVotes.id, existingVote.id));

      await db
        .update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} - 1` })
        .where(eq(reviews.id, reviewId));

      return { success: true, voted: false };
    }

    await db.insert(reviewVotes).values({ reviewId, userId });

    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId));

    return { success: true, voted: true };
  } catch (error) {
    console.error("Toggle Helpful Vote Error:", error);
    return { success: false, error: "Failed to vote." };
  }
};

// ✅ Check if user has voted on a review
export const hasVoted = async (params: {
  reviewId: string;
  userId: string;
}) => {
  const { reviewId, userId } = params;

  try {
    const [vote] = await db
      .select()
      .from(reviewVotes)
      .where(
        and(
          eq(reviewVotes.reviewId, reviewId),
          eq(reviewVotes.userId, userId)
        )
      )
      .limit(1);

    return { success: true, hasVoted: !!vote };
  } catch (error) {
    return { success: false, hasVoted: false };
  }
};

// ✅ Check if user can review a book
export const canReview = async (params: {
  userId: string;
  bookId: string;
}) => {
  const { userId, bookId } = params;

  try {
    const [borrow] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId)
        )
      )
      .limit(1);

    return { success: true, canReview: !!borrow };
  } catch (error) {
    return { success: false, canReview: false };
  }
};

// ✅ Update book's average rating
async function updateBookRating(bookId: string) {
  try {
    const [result] = await db
      .select({
        avg: sql<string>`COALESCE(AVG(rating), 0)::text`,
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));

    const newRating = parseFloat(result?.avg || "0").toFixed(1);

    await db
      .update(books)
      .set({ rating: newRating })
      .where(eq(books.id, bookId));
  } catch (error) {
    console.error("Update Book Rating Error:", error);
  }
}