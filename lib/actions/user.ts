"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getUserById = async (id: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Get User Error:", error);
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Get User By Email Error:", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    bio?: string;
  }
) => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        lastActivityDate: new Date().toISOString().split("T")[0],
      })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/my-profile/settings");
    revalidatePath("/my-profile");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Update User Profile Error:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
};

export const updateNotificationSettings = async (
  userId: string,
  settings: {
    emailNotifications?: boolean;
    borrowConfirmationEmails?: boolean;
    returnConfirmationEmails?: boolean;
    dueReminderEmails?: boolean;
    promotionalEmails?: boolean;
  }
) => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/my-profile/settings");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Update Notification Settings Error:", error);
    return {
      success: false,
      error: "Failed to update notification settings. Please try again.",
    };
  }
};

export const updateThemePreference = async (
  userId: string,
  theme: "dark" | "light"
) => {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ theme })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/my-profile/settings");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Update Theme Error:", error);
    return {
      success: false,
      error: "Failed to update theme preference.",
    };
  }
};