import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { bookHolds } from "@/database/schema";
import { eq, and, lt } from "drizzle-orm";
import { processNextHold } from "@/lib/actions/hold";

export async function GET() {
  try {
    const now = new Date();
    console.log("⏰ Running expire-holds job...");

    // Find all READY holds that have expired
    const expiredHolds = await db
      .select()
      .from(bookHolds)
      .where(and(eq(bookHolds.status, "READY"), lt(bookHolds.expiresAt, now)));

    console.log(`Found ${expiredHolds.length} expired holds`);

    let expiredCount = 0;

    for (const hold of expiredHolds) {
      // Mark as EXPIRED
      await db
        .update(bookHolds)
        .set({ status: "EXPIRED" })
        .where(eq(bookHolds.id, hold.id));

      // Process next hold in queue
      await processNextHold(hold.bookId);

      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredCount} holds`,
      count: expiredCount,
    });
  } catch (error) {
    console.error("Expire holds error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}