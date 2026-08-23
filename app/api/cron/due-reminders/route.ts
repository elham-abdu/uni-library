import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, and, lt, gte, sql } from "drizzle-orm";
import { sendDueReminder, sendOverdueEmail } from "@/lib/email/service";

export async function GET() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get borrows that are due in 3 days or overdue
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    // Find borrows that are due in exactly 3 days
    const dueSoon = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(
        and(
          eq(borrowRecords.status, "BORROWED"),
          eq(borrowRecords.dueDate, dueDateStr)
        )
      );

    // Find overdue borrows
    const overdue = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(
        and(
          eq(borrowRecords.status, "BORROWED"),
          lt(borrowRecords.dueDate, todayStr)
        )
      );

    // Send due soon reminders
    for (const record of dueSoon) {
      const daysLeft = 3;
      await sendDueReminder(
        record.users.email,
        record.users.fullName,
        record.books.title,
        record.borrow_records.dueDate,
        daysLeft
      );
    }

    // Send overdue emails
    for (const record of overdue) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(record.borrow_records.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      await sendOverdueEmail(
        record.users.email,
        record.users.fullName,
        record.books.title,
        daysOverdue
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${dueSoon.length} due reminders and ${overdue.length} overdue notifications`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}