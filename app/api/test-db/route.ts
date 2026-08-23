import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute("SELECT NOW() as current_time");
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      time: result.rows?.[0]?.current_time || "Connected"
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Database connection failed"
    }, { status: 500 });
  }
}
