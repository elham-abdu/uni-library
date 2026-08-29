import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language } = await request.json();

    const [updatedUser] = await db
      .update(users)
      .set({ language })
      .where(eq(users.id, session.user.id))
      .returning();

    revalidatePath("/my-profile/settings");

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Language Error:", error);
    return NextResponse.json(
      { error: "Failed to update language preference" },
      { status: 500 }
    );
  }
}