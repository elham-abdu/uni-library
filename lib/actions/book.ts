"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { bookSchema } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import type { BookParams } from "@/types";

export const createBook = async (params: BookParams) => {
  try {
    // 1. Validate incoming parameters against Zod schema
    const validationResult = bookSchema.safeParse(params);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid book details provided.",
      };
    }

    // 2. Insert new book into Neon PostgreSQL database
    const [newBook] = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
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

export const getBooks = async (limit: number = 10) => {
  try {
    const allBooks = await db
      .select()
      .from(books)
      .limit(limit)
      .orderBy(desc(books.createdAt));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(allBooks)),
    };
  } catch (error) {
    console.error("Get Books Error:", error);
    return {
      success: false,
      error: "Failed to fetch books.",
    };
  }
};

export const getBookById = async (id: string) => {
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
    };
  }
};

export const borrowBook = async (params: { userId: string; bookId: string }) => {
  const { userId, bookId } = params;

  // 1. Authenticated User Guard
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to borrow a book.",
    };
  }

  // 2. Sample Book Guard (prevents UUID syntax error in PostgreSQL)
  if (bookId.startsWith("c0a80101-")) {
    return {
      success: false,
      error: "Sample books cannot be borrowed. Please insert real books into Neon DB via Admin Panel.",
    };
  }

  try {
    // 3. Fetch book to verify availability
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book || book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available for borrowing.",
      };
    }

    // 4. Set due date (14 days from today)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // 5. Create borrow record
    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "BORROWED",
      })
      .returning();

    // 6. Decrement available copies
    await db
      .update(books)
      .set({ availableCopies: book.availableCopies - 1 })
      .where(eq(books.id, bookId));

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