"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { signIn } from "@/auth";
import { AuthCredentials, SignInCredentials } from "@/types";
import { sendWelcomeEmail } from "@/lib/email/service";

export const signUp = async (params: AuthCredentials) => {
  const { fullname, email, universityId, password, universityCard } = params;

  console.log("📝 Sign up attempt for:", email);

  const validationResult = signUpSchema.safeParse({
    fullname,
    email,
    universityId,
    password,
    universityCard,
  });

  if (!validationResult.success) {
    console.log("❌ Validation failed:", validationResult.error);
    return { success: false, error: "Invalid form input data." };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("❌ User already exists:", email);
    return { success: false, error: "User with this email already exists." };
  }

  const hashedPassword = await hash(password, 10);

  try {
    console.log("📝 Creating user...");
    await db.insert(users).values({
      fullName: fullname,
      email,
      universityId: universityId.toString(),
      password: hashedPassword,
      universityCard,
      status: "APPROVED",
      role: "USER",
    });
    console.log("✅ User created successfully");

    // Send welcome email
    console.log("📧 Attempting to send welcome email to:", email);
    try {
      const emailResult = await sendWelcomeEmail(email, fullname);
      console.log("📧 Welcome email result:", emailResult);
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
    }

    console.log("📝 Signing in user...");
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("✅ User signed in successfully");

    return { success: true };
  } catch (error) {
    console.error("❌ SignUp Error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
};

export const signInWithCredentials = async (params: SignInCredentials) => {
  const { email, password } = params;

  const validationResult = signInSchema.safeParse({ email, password });

  if (!validationResult.success) {
    return { success: false, error: "Invalid email or password format." };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("SignIn Error:", error);
    return { success: false, error: "Invalid email or password." };
  }
};