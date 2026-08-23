import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { sampleBooks } from "@/constants";

export async function GET() {
  try {
    // Check if books already exist
    const existingBooks = await db.select().from(books).limit(1);
    
    if (existingBooks.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Books already exist in database",
        count: existingBooks.length
      });
    }

    // Insert sample books
    const inserted = [];
    for (const book of sampleBooks) {
      const [newBook] = await db.insert(books).values({
        title: book.title,
        author: book.author || "Unknown",
        genre: book.genre,
        rating: String(book.rating || 0), // Convert to string for numeric type
        coverUrl: book.coverUrl || "",
        coverColor: book.coverColor,
        description: book.description || "",
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || 1,
        videoUrl: book.videoUrl || "",
        summary: book.summary || "",
      }).returning();
      inserted.push(newBook);
    }

    return NextResponse.json({
      success: true,
      message: `Inserted ${inserted.length} books`,
      books: inserted
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}