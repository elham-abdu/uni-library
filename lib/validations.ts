import { z } from "zod";

export const signUpSchema = z.object({
  fullname: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  universityId: z.coerce.number().min(1, "University ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  universityCard: z.string().nonempty("University ID Card is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});