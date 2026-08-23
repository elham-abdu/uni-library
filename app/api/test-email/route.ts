import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/service";

export async function GET() {
  try {
    console.log("🧪 Testing email...");
    const result = await sendWelcomeEmail(
      "your-test-email@gmail.com", // Replace with your email
      "Test User"
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
      },
      { status: 500 }
    );
  }
}