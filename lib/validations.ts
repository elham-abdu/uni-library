import { z } from "zod";

export const signUpSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  universityId: z.coerce.number().min(1, "University ID is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  universityCard: z.string().nonempty("University ID card is required"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export const bookSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1000),
  author: z.string().trim().min(2).max(100),
  genre: z.string().trim().min(2).max(50),
  rating: z.number().min(1).max(5),
  totalCopies: z.coerce.number().positive().lte(10000),
  coverUrl: z.string().nonempty("Cover image is required"),
  coverColor: z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color code"),
  videoUrl: z.string().nonempty("Video URL is required"),
  summary: z.string().trim().min(10),
});