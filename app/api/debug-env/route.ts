import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasResendToken: !!process.env.RESEND_TOKEN,
    tokenLength: process.env.RESEND_TOKEN?.length || 0,
    // Don't expose the actual token for security
  });
}