import { NextResponse } from "next/server";
import { sendBorrowConfirmation } from "@/lib/email/service";

export async function GET() {
  try {
    console.log("🧪 Testing borrow confirmation email...");
    
    const result = await sendBorrowConfirmation(
      "koniabdu81@gmail.com", // Change to your email
      "Test User",
      "Test Book",
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    
    console.log("🧪 Test result:", result);
    
    return NextResponse.json({
      success: true,
      result,
      message: "Test email sent! Check your inbox.",
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
