"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendReturnConfirmation } from "@/lib/email/service";

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverColor: string;
  coverUrl: string;
  borrowId: string;
  borrowDate: Date;
  dueDate: string;
  status: string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  videoUrl?: string;
  summary?: string;
  createdAt?: Date | null;
}

export const getBorrowedBooks = async (userId: string) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
        data: [] as BorrowedBook[],
      };
    }

    const records = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.status, "BORROWED")
        )
      )
      .orderBy(desc(borrowRecords.borrowDate));

    const borrowedBooks: BorrowedBook[] = records.map((record) => ({
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
      totalCopies: record.books.totalCopies,
      availableCopies: record.books.availableCopies,
      description: record.books.description,
      videoUrl: record.books.videoUrl,
      summary: record.books.summary,
      createdAt: record.books.createdAt,
    }));

    return {
      success: true,
      data: borrowedBooks,
    };
  } catch (error) {
    console.error("Get Borrowed Books Error:", error);
    return {
      success: false,
      error: "Failed to fetch borrowed books",
      data: [] as BorrowedBook[],
    };
  }
};

export const returnBook = async (params: { borrowId: string; userId: string }) => {
  const { borrowId, userId } = params;

  try {
    const [borrowRecord] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.id, borrowId),
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.status, "BORROWED")
        )
      )
      .limit(1);

    if (!borrowRecord) {
      return {
        success: false,
        error: "Borrow record not found",
      };
    }

    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, borrowRecord.bookId))
      .limit(1);

    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    const today = new Date().toISOString().split("T")[0];
    await db
      .update(borrowRecords)
      .set({
        status: "RETURNED",
        returnDate: today,
      })
      .where(eq(borrowRecords.id, borrowId));

    await db
      .update(books)
      .set({
        availableCopies: book.availableCopies + 1,
      })
      .where(eq(books.id, borrowRecord.bookId));

    // Send email notification after successful return
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      console.log("📧 User found for return email:", user?.email);
      
      if (user && user.email) {
        console.log("📧 Attempting to send return confirmation to:", user.email);
        const emailResult = await sendReturnConfirmation(
          user.email,
          user.fullName,
          book.title
        );
        console.log("📧 Return confirmation email result:", emailResult);
      } else {
        console.log("❌ No user found or user has no email");
      }
    } catch (emailError) {
      console.error("❌ Failed to send return confirmation email:", emailError);
    }

    revalidatePath("/my-profile");
    revalidatePath(`/books/${borrowRecord.bookId}`);
    revalidatePath("/");

    return {
      success: true,
      message: "Book returned successfully!",
    };
  } catch (error) {
    console.error("Return Book Error:", error);
    return {
      success: false,
      error: "Failed to return book. Please try again.",
    };
  }
};

export const getBorrowHistory = async (userId: string) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
        data: [] as BorrowedBook[],
      };
    }

    const records = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.userId, userId))
      .orderBy(desc(borrowRecords.borrowDate));

    const borrowHistory: BorrowedBook[] = records.map((record) => ({
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
      data: [] as BorrowedBook[],
    };
  }
};
