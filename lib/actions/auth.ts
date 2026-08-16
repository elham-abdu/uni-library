"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { signIn } from "@/auth";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";
import type { AuthCredentials } from "@/types";

export const signUp = async (params: AuthCredentials) => {
  const { fullname, email, universityId, password, universityCard } = params;

  // 1. Validate form fields against Zod schema
  const validationResult = signUpSchema.safeParse({
    fullname,
    email,
    universityId,
    password,
    universityCard,
  });

  if (!validationResult.success) {
    return { success: false, error: "Invalid form input data." };
  }

  // 2. Check if user with existing email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User with this email already exists." };
  }

  // 3. Hash user password securely
  const hashedPassword = await hash(password, 10);

  try {
    // 4. Insert new user record into Neon PostgreSQL
    await db.insert(users).values({
      fullName: fullname,
      email,
      universityId: universityId.toString(),
      password: hashedPassword,
      universityCard,
    });

    // 5. Trigger automated onboarding workflow via QStash
    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName: fullname,
      },
    });

    // 6. Automatically sign in the user after creation
    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.error("SignUp Error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
};

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  // 1. Validate credentials against Zod schema
  const validationResult = signInSchema.safeParse({ email, password });

  if (!validationResult.success) {
    return { success: false, error: "Invalid email or password format." };
  }

  try {
    // 2. Authenticate using NextAuth credentials provider
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