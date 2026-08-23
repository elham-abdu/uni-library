import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";

export async function GET() {
  try {
    const allBooks = await db.select().from(books);
    return NextResponse.json({
      success: true,
      count: allBooks.length,
      books: allBooks
    });
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}