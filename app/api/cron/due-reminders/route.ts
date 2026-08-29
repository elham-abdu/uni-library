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

    console.log("📅 Running due reminders...");
    console.log("📅 Today:", todayStr);
    console.log("📅 Three days from now:", threeDaysStr);

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

    console.log("📧 Found", dueSoon.length, "books due in 3 days");

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

    console.log("⚠️ Found", overdue.length, "overdue books");

    let sentCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Send due reminders
    for (const record of dueSoon) {
      try {
        const result = await sendDueReminder(
          record.users.email,
          record.users.fullName,
          record.books.title,
          record.borrow_records.dueDate,
          3
        );
        if (result.success) {
          sentCount++;
          console.log(`✅ Due reminder sent to ${record.users.email}`);
        } else {
          errors.push({ email: record.users.email, error: result.error || "Unknown error" });
          console.log(`❌ Failed to send due reminder to ${record.users.email}`);
        }
      } catch (error) {
        errors.push({ email: record.users.email, error: String(error) });
        console.error(`❌ Error sending due reminder to ${record.users.email}:`, error);
      }
    }

    // Send overdue emails
    for (const record of overdue) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(record.borrow_records.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      try {
        const result = await sendOverdueEmail(
          record.users.email,
          record.users.fullName,
          record.books.title,
          daysOverdue
        );
        if (result.success) {
          sentCount++;
          console.log(`✅ Overdue email sent to ${record.users.email}`);
        } else {
          errors.push({ email: record.users.email, error: result.error || "Unknown error" });
          console.log(`❌ Failed to send overdue email to ${record.users.email}`);
        }
      } catch (error) {
        errors.push({ email: record.users.email, error: String(error) });
        console.error(`❌ Error sending overdue email to ${record.users.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} email reminders`,
      dueSoon: dueSoon.length,
      overdue: overdue.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process reminders",
        details: String(error)
      },
      { status: 500 }
    );
  }
}
