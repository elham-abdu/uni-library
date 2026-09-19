"use server";

import { db } from "@/database/drizzle";
import { borrowRecords, books, bookHolds, users } from "@/database/schema";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendRenewalConfirmation } from "@/lib/email/service";

const MAX_RENEWALS = 2;
const RENEWAL_DAYS = 14;

// ✅ Renew a borrowed book
export const renewBook = async (params: {
  borrowId: string;
  userId: string;
}) => {
  const { borrowId, userId } = params;

  if (!borrowId || !userId) {
    return { success: false, error: "Borrow ID and User ID are required." };
  }

  try {
    // 1. Find the borrow record
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
        error: "Borrow record not found or already returned.",
      };
    }

    // 2. Check renewal limit
    if (borrowRecord.renewalCount >= MAX_RENEWALS) {
      return {
        success: false,
        error: `You've reached the maximum of ${MAX_RENEWALS} renewals for this book.`,
      };
    }

    // 3. Check if overdue
    const today = new Date();
    const dueDate = new Date(borrowRecord.dueDate);
    if (dueDate < today) {
      return {
        success: false,
        error: "Cannot renew an overdue book. Please return it first.",
      };
    }

    // 4. Check if anyone has a hold on this book
    const [holdCheck] = await db
      .select({ total: count() })
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.bookId, borrowRecord.bookId),
          eq(bookHolds.status, "PENDING")
        )
      );

    if (holdCheck.total > 0) {
      return {
        success: false,
        error: `Cannot renew — ${holdCheck.total} user${
          holdCheck.total > 1 ? "s are" : " is"
        } waiting in the hold queue.`,
      };
    }

    // 5. Calculate new due date
    const newDueDate = new Date(borrowRecord.dueDate);
    newDueDate.setDate(newDueDate.getDate() + RENEWAL_DAYS);
    const formattedNewDueDate = newDueDate.toISOString().split("T")[0];

    // 6. Update borrow record
    const [updatedRecord] = await db
      .update(borrowRecords)
      .set({
        dueDate: formattedNewDueDate,
        renewalCount: borrowRecord.renewalCount + 1,
      })
      .where(eq(borrowRecords.id, borrowId))
      .returning();

    // 7. ✅ Send renewal confirmation email
    try {
      // Fetch user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // Fetch book info
      const [book] = await db
        .select()
        .from(books)
        .where(eq(books.id, borrowRecord.bookId))
        .limit(1);

      if (user && user.email && book) {
        console.log("📧 Sending renewal confirmation to:", user.email);
        const emailResult = await sendRenewalConfirmation(
          user.email,
          user.fullName,
          book.title,
          formattedNewDueDate,
          borrowRecord.renewalCount + 1
        );
        console.log("📧 Renewal confirmation email result:", emailResult);
      }
    } catch (emailError) {
      console.error("❌ Failed to send renewal confirmation:", emailError);
      // Don't fail the renewal if email fails
    }

    revalidatePath("/my-profile");
    revalidatePath(`/books/${borrowRecord.bookId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedRecord)),
      message: `Book renewed! New due date: ${newDueDate.toLocaleDateString()}`,
      newDueDate: formattedNewDueDate,
    };
  } catch (error) {
    console.error("Renew Book Error:", error);
    return { success: false, error: "Failed to renew book. Please try again." };
  }
};

// ✅ Check if a book can be renewed (helper for UI)
export const canRenew = async (params: {
  borrowId: string;
  userId: string;
}) => {
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
      return { canRenew: false, reason: "Borrow not found" };
    }

    if (borrowRecord.renewalCount >= MAX_RENEWALS) {
      return {
        canRenew: false,
        reason: `Max renewals reached (${MAX_RENEWALS})`,
      };
    }

    const today = new Date();
    const dueDate = new Date(borrowRecord.dueDate);
    if (dueDate < today) {
      return { canRenew: false, reason: "Book is overdue" };
    }

    const [holdCheck] = await db
      .select({ total: count() })
      .from(bookHolds)
      .where(
        and(
          eq(bookHolds.bookId, borrowRecord.bookId),
          eq(bookHolds.status, "PENDING")
        )
      );

    if (holdCheck.total > 0) {
      return { canRenew: false, reason: "Book is on hold for someone else" };
    }

    return {
      canRenew: true,
      renewalCount: borrowRecord.renewalCount,
      remaining: MAX_RENEWALS - borrowRecord.renewalCount,
    };
  } catch (error) {
    console.error("Can Renew Error:", error);
    return { canRenew: false, reason: "Error checking renewal status" };
  }
};