"use server";

import { db } from "@/database/drizzle";
import { readingLists, books } from "@/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ReadingListStatus = "WANT_TO_READ" | "CURRENTLY_READING" | "FINISHED";

// ✅ Add book to reading list (or update status if it exists)
export const addToReadingList = async (params: {
  userId: string;
  bookId: string;
  status: ReadingListStatus;
}) => {
  const { userId, bookId, status } = params;

  if (!userId || !bookId) {
    return { success: false, error: "User ID and Book ID are required." };
  }

  try {
    // Check if book exists
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, error: "Book not found." };
    }

    // Check if already in a list
    const [existing] = await db
      .select()
      .from(readingLists)
      .where(
        and(
          eq(readingLists.userId, userId),
          eq(readingLists.bookId, bookId)
        )
      )
      .limit(1);

    if (existing) {
      // Update status
      const [updated] = await db
        .update(readingLists)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(readingLists.id, existing.id))
        .returning();

      revalidatePath("/my-profile/reading-lists");
      revalidatePath(`/books/${bookId}`);

      return {
        success: true,
        data: JSON.parse(JSON.stringify(updated)),
        message: "Reading list updated!",
      };
    }

    // Create new entry
    const [newEntry] = await db
      .insert(readingLists)
      .values({
        userId,
        bookId,
        status,
      })
      .returning();

    revalidatePath("/my-profile/reading-lists");
    revalidatePath(`/books/${bookId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newEntry)),
      message: "Added to reading list!",
    };
  } catch (error) {
    console.error("Add to Reading List Error:", error);
    return {
      success: false,
      error: "Failed to add to reading list. Please try again.",
    };
  }
};

// ✅ Remove from reading list
export const removeFromReadingList = async (params: {
  userId: string;
  bookId: string;
}) => {
  const { userId, bookId } = params;

  try {
    await db
      .delete(readingLists)
      .where(
        and(
          eq(readingLists.userId, userId),
          eq(readingLists.bookId, bookId)
        )
      );

    revalidatePath("/my-profile/reading-lists");
    revalidatePath(`/books/${bookId}`);

    return { success: true, message: "Removed from reading list." };
  } catch (error) {
    console.error("Remove from Reading List Error:", error);
    return { success: false, error: "Failed to remove from reading list." };
  }
};

// ✅ Get user's reading list by status
export const getReadingList = async (params: {
  userId: string;
  status?: ReadingListStatus;
}) => {
  const { userId, status } = params;

  try {
    if (!userId) {
      return { success: false, error: "User ID is required.", data: [] };
    }

    const conditions = status
      ? and(
          eq(readingLists.userId, userId),
          eq(readingLists.status, status)
        )
      : eq(readingLists.userId, userId);

    const results = await db
      .select()
      .from(readingLists)
      .innerJoin(books, eq(readingLists.bookId, books.id))
      .where(conditions)
      .orderBy(desc(readingLists.addedAt));

    const list = results.map((record) => ({
      id: record.reading_lists.id,
      bookId: record.books.id,
      title: record.books.title,
      author: record.books.author,
      genre: record.books.genre,
      coverUrl: record.books.coverUrl,
      coverColor: record.books.coverColor,
      rating: record.books.rating,
      availableCopies: record.books.availableCopies,
      description: record.books.description,
      status: record.reading_lists.status,
      notes: record.reading_lists.notes,
      addedAt: record.reading_lists.addedAt,
    }));

    return { success: true, data: list };
  } catch (error) {
    console.error("Get Reading List Error:", error);
    return { success: false, error: "Failed to fetch reading list.", data: [] };
  }
};

// ✅ Get book's status in user's reading list
export const getBookReadingListStatus = async (params: {
  userId: string;
  bookId: string;
}) => {
  const { userId, bookId } = params;

  try {
    const [entry] = await db
      .select()
      .from(readingLists)
      .where(
        and(
          eq(readingLists.userId, userId),
          eq(readingLists.bookId, bookId)
        )
      )
      .limit(1);

    return {
      success: true,
      data: entry
        ? {
            id: entry.id,
            status: entry.status,
            notes: entry.notes,
          }
        : null,
    };
  } catch (error) {
    console.error("Get Book Reading List Status Error:", error);
    return { success: false, data: null };
  }
};

// ✅ Get reading list stats for user
export const getReadingListStats = async (userId: string) => {
  try {
    if (!userId) {
      return {
        wantToRead: 0,
        currentlyReading: 0,
        finished: 0,
        total: 0,
      };
    }

    const entries = await db
      .select({
        status: readingLists.status,
        count: sql<number>`count(*)::int`,
      })
      .from(readingLists)
      .where(eq(readingLists.userId, userId))
      .groupBy(readingLists.status);

    const stats = {
      wantToRead: 0,
      currentlyReading: 0,
      finished: 0,
      total: 0,
    };

    entries.forEach((entry) => {
      if (entry.status === "WANT_TO_READ") stats.wantToRead = entry.count;
      if (entry.status === "CURRENTLY_READING")
        stats.currentlyReading = entry.count;
      if (entry.status === "FINISHED") stats.finished = entry.count;
      stats.total += entry.count;
    });

    return stats;
  } catch (error) {
    console.error("Get Reading List Stats Error:", error);
    return { wantToRead: 0, currentlyReading: 0, finished: 0, total: 0 };
  }
};