import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    console.log("🔍 Debug User - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    console.log("🔍 User found:", !!user);
    console.log("🔍 User email:", user?.email);
    console.log("🔍 User fullName:", user?.fullName);

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        fullName: user?.fullName,
        universityId: user?.universityId,
      },
    });
  } catch (error) {
    console.error("Debug user error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
