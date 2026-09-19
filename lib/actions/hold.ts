"use server";

import { db } from "@/database/drizzle";
import { bookHolds, books, users, borrowRecords } from "@/database/schema";
import { eq, and, count, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  sendHoldReadyEmail,
  sendHoldConfirmation,
} from "@/lib/email/service";

const HOLD_EXPIRY_HOURS = 24;

// ✅ Place a hold
export const placeHold = async (params: { userId: string; bookId: string }) => {
  const { userId, bookId } = params;

  if (!userId || !bookId) {
    return { success: false, error: "User ID and Book ID are required." };
  }

  try {
    // 1. Check if book exists
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, error: "Book not found." };
    }

    // 2. If book is available, no need to place hold
    if (book.availableCopies > 0) {
      return {
        success: false,
        error: "Book is available! You can borrow it directly.",
      };
    }

    // 3. Check if user already has an active hold on this book
    const [existingHold] = await db
      .select()
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.userId, userId),
          eq(bookHolds.bookId, bookId),
          eq(bookHolds.status, "PENDING")
        )
      )
      .limit(1);

    if (existingHold) {
      return {
        success: false,
        error: `You already have a hold on this book (position #${existingHold.queuePosition}).`,
      };
    }

    // 4. Check if user already has a READY hold
    const [readyHold] = await db
      .select()
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.userId, userId),
          eq(bookHolds.bookId, bookId),
          eq(bookHolds.status, "READY")
        )
      )
      .limit(1);

    if (readyHold) {
      return {
        success: false,
        error: "You already have this book ready to borrow!",
      };
    }

    // 5. Check if user already borrowed this book
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
        error: "You already have this book borrowed.",
      };
    }

    // 6. Get current queue count for this book
    const [queueCount] = await db
      .select({ count: count() })
      .from(bookHolds)
      .where(
        and(eq(bookHolds.bookId, bookId), eq(bookHolds.status, "PENDING"))
      );

    const queuePosition = (queueCount?.count || 0) + 1;

    // 7. Create the hold
    const [hold] = await db
      .insert(bookHolds)
      .values({
        userId,
        bookId,
        status: "PENDING",
        queuePosition,
      })
      .returning();

    // 8. ✅ Send hold confirmation email
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user && user.email) {
        console.log("📧 Sending hold confirmation to:", user.email);
        const emailResult = await sendHoldConfirmation(
          user.email,
          user.fullName,
          book.title,
          queuePosition
        );
        console.log("📧 Hold confirmation email result:", emailResult);
      }
    } catch (emailError) {
      console.error("❌ Failed to send hold confirmation email:", emailError);
      // Don't fail the hold if email fails
    }

    revalidatePath(`/books/${bookId}`);
    revalidatePath("/my-profile");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(hold)),
      message: `Hold placed! You're #${queuePosition} in line.`,
    };
  } catch (error) {
    console.error("Place Hold Error:", error);
    return { success: false, error: "Failed to place hold. Please try again." };
  }
};

// ✅ Cancel a hold
export const cancelHold = async (params: { holdId: string; userId: string }) => {
  const { holdId, userId } = params;

  try {
    const [hold] = await db
      .select()
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.id, holdId),
          eq(bookHolds.userId, userId),
          eq(bookHolds.status, "PENDING")
        )
      )
      .limit(1);

    if (!hold) {
      return { success: false, error: "Hold not found or already processed." };
    }

    await db
      .update(bookHolds)
      .set({ status: "CANCELLED" })
      .where(eq(bookHolds.id, holdId));

    // Recalculate queue positions
    const remainingHolds = await db
      .select()
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.bookId, hold.bookId),
          eq(bookHolds.status, "PENDING")
        )
      )
      .orderBy(asc(bookHolds.queuePosition));

    for (let i = 0; i < remainingHolds.length; i++) {
      await db
        .update(bookHolds)
        .set({ queuePosition: i + 1 })
        .where(eq(bookHolds.id, remainingHolds[i].id));
    }

    revalidatePath(`/books/${hold.bookId}`);
    revalidatePath("/my-profile");

    return { success: true, message: "Hold cancelled successfully." };
  } catch (error) {
    console.error("Cancel Hold Error:", error);
    return { success: false, error: "Failed to cancel hold." };
  }
};

// ✅ Get user's active holds
export const getUserHolds = async (userId: string) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required", data: [] };
    }

    const holds = await db
      .select()
      .from(bookHolds)
      .innerJoin(books, eq(bookHolds.bookId, books.id))
      .where(
        and(eq(bookHolds.userId, userId), eq(bookHolds.status, "PENDING"))
      )
      .orderBy(asc(bookHolds.queuePosition));

    const holdsWithBooks = holds.map((record) => ({
      id: record.book_holds.id,
      bookId: record.books.id,
      title: record.books.title,
      author: record.books.author,
      genre: record.books.genre,
      coverUrl: record.books.coverUrl,
      coverColor: record.books.coverColor,
      queuePosition: record.book_holds.queuePosition,
      placedAt: record.book_holds.placedAt,
      status: record.book_holds.status,
    }));

    return { success: true, data: holdsWithBooks };
  } catch (error) {
    console.error("Get User Holds Error:", error);
    return { success: false, error: "Failed to fetch holds", data: [] };
  }
};

// ✅ Check if user has a hold on a specific book
export const getUserHoldForBook = async (params: {
  userId: string;
  bookId: string;
}) => {
  const { userId, bookId } = params;

  try {
    const [hold] = await db
      .select()
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.userId, userId),
          eq(bookHolds.bookId, bookId),
          eq(bookHolds.status, "PENDING")
        )
      )
      .limit(1);

    return {
      success: true,
      data: hold ? JSON.parse(JSON.stringify(hold)) : null,
    };
  } catch (error) {
    console.error("Get User Hold Error:", error);
    return { success: false, data: null };
  }
};

// ✅ Get queue info for a book (total holds)
export const getBookHoldCount = async (bookId: string) => {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(bookHolds)
      .where(
        and(eq(bookHolds.bookId, bookId), eq(bookHolds.status, "PENDING"))
      );

    return result?.count || 0;
  } catch (error) {
    console.error("Get Book Hold Count Error:", error);
    return 0;
  }
};

// ✅ Process holds when a book is returned
export const processNextHold = async (bookId: string) => {
  try {
    const [nextHold] = await db
      .select()
      .from(bookHolds)
      .innerJoin(books, eq(bookHolds.bookId, books.id))
      .innerJoin(users, eq(bookHolds.userId, users.id))
      .where(
        and(eq(bookHolds.bookId, bookId), eq(bookHolds.status, "PENDING"))
      )
      .orderBy(asc(bookHolds.queuePosition))
      .limit(1);

    if (!nextHold) {
      return { success: true, message: "No holds in queue" };
    }

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + HOLD_EXPIRY_HOURS);

    await db
      .update(bookHolds)
      .set({
        status: "READY",
        notifiedAt: new Date(),
        expiresAt: expiryDate,
      })
      .where(eq(bookHolds.id, nextHold.book_holds.id));

    try {
      await sendHoldReadyEmail(
        nextHold.users.email,
        nextHold.users.fullName,
        nextHold.books.title,
        expiryDate
      );
      console.log(`✅ Hold-ready email sent to ${nextHold.users.email}`);
    } catch (emailError) {
      console.error("Failed to send hold-ready email:", emailError);
    }

    revalidatePath(`/books/${bookId}`);
    revalidatePath("/my-profile");

    return {
      success: true,
      message: `Notified ${nextHold.users.email} that book is ready`,
    };
  } catch (error) {
    console.error("Process Next Hold Error:", error);
    return { success: false, error: "Failed to process next hold" };
  }
};

// ✅ Expire old holds
export const expireOldHolds = async () => {
  try {
    const now = new Date();

    const expiredHolds = await db
      .select()
      .from(bookHolds)
      .where(eq(bookHolds.status, "READY"));

    let expiredCount = 0;
    for (const hold of expiredHolds) {
      if (hold.expiresAt && hold.expiresAt < now) {
        await db
          .update(bookHolds)
          .set({ status: "EXPIRED" })
          .where(eq(bookHolds.id, hold.id));
        expiredCount++;

        await processNextHold(hold.bookId);
      }
    }

    return {
      success: true,
      message: `Expired ${expiredCount} holds`,
    };
  } catch (error) {
    console.error("Expire Holds Error:", error);
    return { success: false, error: "Failed to expire holds" };
  }
};