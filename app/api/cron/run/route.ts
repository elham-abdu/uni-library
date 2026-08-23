import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendDueReminder, sendOverdueEmail } from "@/lib/email/service";

export async function GET() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split("T")[0];

    // Get borrows due in 3 days
    const dueSoon = await db
      .select()
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(
        and(
          eq(borrowRecords.status, "BORROWED"),
          eq(borrowRecords.dueDate, threeDaysStr)
        )
      );

    // Get overdue borrows
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

    // Send emails
    let sentCount = 0;
    for (const record of dueSoon) {
      await sendDueReminder(
        record.users.email,
        record.users.fullName,
        record.books.title,
        record.borrow_records.dueDate,
        3
      );
      sentCount++;
    }

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
      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} email reminders`,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}