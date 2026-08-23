"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { bookSchema } from "@/lib/validations";
import { desc, eq, and, sql, ilike, count, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { BookParams } from "@/types";
import { sendBorrowConfirmation } from "@/lib/email/service";

export interface GetBooksOptions {
  limit?: number;
  offset?: number;
  search?: string;
  genre?: string;
  availableOnly?: boolean;
  sortBy?: "newest" | "oldest" | "highestRated" | "available";
}

export const createBook = async (params: BookParams) => {
  try {
    const validationResult = bookSchema.safeParse(params);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid book details provided.",
      };
    }

    const [newBook] = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
        rating: String(params.rating),
      })
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook)),
    };
  } catch (error) {
    console.error("Create Book Error:", error);
    return {
      success: false,
      error: "Failed to create book. Please try again.",
    };
  }
};

export const getBooks = async (options: GetBooksOptions = {}) => {
  try {
    const {
      limit = 10,
      offset = 0,
      search = "",
      genre = "",
      availableOnly = false,
      sortBy = "newest",
    } = options;

    // Build conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(books.genre, `%${search}%`)
        )
      );
    }

    if (genre) {
      conditions.push(eq(books.genre, genre));
    }

    if (availableOnly) {
      conditions.push(sql`${books.availableCopies} > 0`);
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(books)
      .where(whereCondition);

    const total = totalResult[0]?.count || 0;

    // Get all genres for filter (do this before the main query)
    const genresResult = await db
      .select({ genre: books.genre })
      .from(books)
      .groupBy(books.genre);

    const genres = genresResult.map((g) => g.genre);

    // Build and execute the main query with sorting
    let allBooks;

    if (sortBy === "newest") {
      allBooks = await db
        .select()
        .from(books)
        .where(whereCondition)
        .orderBy(desc(books.createdAt))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === "oldest") {
      allBooks = await db
        .select()
        .from(books)
        .where(whereCondition)
        .orderBy(books.createdAt)
        .limit(limit)
        .offset(offset);
    } else if (sortBy === "highestRated") {
      allBooks = await db
        .select()
        .from(books)
        .where(whereCondition)
        .orderBy(desc(books.rating))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === "available") {
      allBooks = await db
        .select()
        .from(books)
        .where(whereCondition)
        .orderBy(desc(books.availableCopies))
        .limit(limit)
        .offset(offset);
    } else {
      allBooks = await db
        .select()
        .from(books)
        .where(whereCondition)
        .orderBy(desc(books.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(allBooks)),
      total,
      genres,
    };
  } catch (error) {
    console.error("Get Books Error:", error);
    return {
      success: false,
      error: "Failed to fetch books.",
      data: [],
      total: 0,
      genres: [],
    };
  }
};

export const getBookById = async (id: string) => {
  if (!id) {
    return {
      success: false,
      error: "Book ID is missing.",
      data: null,
    };
  }

  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!book) {
      return {
        success: false,
        error: "Book not found.",
        data: null,
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(book)),
    };
  } catch (error) {
    console.error("Get Book By ID Error:", error);
    return {
      success: false,
      error: "Failed to fetch book details.",
      data: null,
    };
  }
};

export const getActiveBorrowCount = async (userId: string) => {
  try {
    const result = await db
      .select({ count: count() })
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.status, "BORROWED")
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error("Get Active Borrow Count Error:", error);
    return 0;
  }
};

const MAX_BORROW_LIMIT = 3;

export const borrowBook = async (params: { userId: string; bookId: string }) => {
  const { userId, bookId } = params;

  if (!userId || !bookId) {
    return {
      success: false,
      error: "User ID and Book ID are required to borrow a book.",
    };
  }

  try {
    // Check current borrowed count (Max 3 books allowed)
    const [userLoans] = await db
      .select({ total: count() })
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.status, "BORROWED")
        )
      );

    if (userLoans.total >= 3) {
      return {
        success: false,
        error: "You have reached the maximum limit of 3 borrowed books.",
      };
    }

    // Fetch book copies
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, error: "Book not found." };
    }

    if (book.availableCopies <= 0) {
      return { success: false, error: "No copies available for borrowing." };
    }

    // Check existing borrow
    const [existingBorrow] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId),
          eq(borrowRecords.status, "BORROWED")
        )
      )
      .limit(1);

    if (existingBorrow) {
      return {
        success: false,
        error: "You have already borrowed this book.",
      };
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const formattedDueDate = dueDate.toISOString().split("T")[0];

    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        dueDate: formattedDueDate,
        status: "BORROWED",
      })
      .returning();

    await db
      .update(books)
      .set({
        availableCopies: sql`${books.availableCopies} - 1`,
      })
      .where(eq(books.id, bookId));

    // Send email notification after successful borrow
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user && user.email) {
        // Send email in the background (don't await to not block response)
        sendBorrowConfirmation(
          user.email,
          user.fullName,
          book.title,
          formattedDueDate
        ).catch((error) => {
          console.error("Failed to send borrow confirmation email:", error);
        });
      }
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the borrow if email fails
    }

    revalidatePath(`/books/${bookId}`);
    revalidatePath("/my-profile");
    revalidatePath("/");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(record)),
    };
  } catch (error) {
    console.error("Borrow Book Error:", error);
    return {
      success: false,
      error: "Failed to borrow book. Please try again.",
    };
  }
};

export const getBorrowHistory = async (userId: string) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
        data: [],
      };
    }

    const records = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.userId, userId))
      .orderBy(desc(borrowRecords.borrowDate));

    const borrowHistory = records.map((record) => ({
      id: record.books.id,
      title: record.books.title,
      author: record.books.author,
      genre: record.books.genre,
      coverColor: record.books.coverColor,
      coverUrl: record.books.coverUrl,
      borrowId: record.borrow_records.id,
      borrowDate: record.borrow_records.borrowDate,
      dueDate: record.borrow_records.dueDate,
      status: record.borrow_records.status,
      returnDate: record.borrow_records.returnDate,
      totalCopies: record.books.totalCopies,
      availableCopies: record.books.availableCopies,
      description: record.books.description,
      videoUrl: record.books.videoUrl,
      summary: record.books.summary,
      createdAt: record.books.createdAt,
    }));

    return {
      success: true,
      data: borrowHistory,
    };
  } catch (error) {
    console.error("Get Borrow History Error:", error);
    return {
      success: false,
      error: "Failed to fetch borrow history",
      data: [],
    };
  }
};