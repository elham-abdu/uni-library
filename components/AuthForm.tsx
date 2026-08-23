"use client";

import React, { useState } from "react";
import {
  DefaultValues,
  FieldValues,
  Path,
  Resolver,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";

// Define types for form data
interface SignInFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  fullname: string;
  email: string;
  universityId: number;
  password: string;
  universityCard: string;
}

type FormData = SignInFormData | SignUpFormData;

interface Props<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  schema: ZodTypeAny;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignUp = type === "SIGN_UP";
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema as Parameters<typeof zodResolver>[0]) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      // Save credentials if "Remember Me" is checked
      if (!isSignUp && rememberMe) {
        const formData = data as unknown as SignInFormData;
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberedPassword", formData.password);
      } else if (!isSignUp && !rememberMe) {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      toast.success(
        isSignUp ? "🎉 Account created successfully!" : "👋 Welcome back!",
        {
          description: isSignUp 
            ? "You can now explore and borrow books from the library."
            : "You're now signed in to Bookwise.",
          duration: 4000,
        }
      );
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || "Something went wrong. Please try again.", {
        description: isSignUp 
          ? "Please check your information and try again."
          : "Check your email and password and try again.",
      });
    }
  };

  // Get field names from defaultValues
  const fieldNames = Object.keys(defaultValues) as Array<keyof T>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignUp ? "Create a library account" : "Welcome back to BookWise"}
      </h1>
      <p className="text-light-100">
        {isSignUp
          ? "Please complete all fields and upload a valid university ID to gain access to the library"
          : "Access the vast collection of resources, and stay read"}
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {fieldNames.map((field) => (
            <FormField
              key={field as string}
              control={form.control}
              name={field as Path<T>}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field as keyof typeof FIELD_NAMES] || String(field)}
                  </FormLabel>
                  <FormControl>
                    {field === "universityCard" ? (
                      <FileUpload
                        onFileChange={formField.onChange}
                        value={formField.value}
                      />
                    ) : (
                      <Input
                        required
                        type={
                          FIELD_TYPES[field as keyof typeof FIELD_TYPES] ||
                          "text"
                        }
                        {...formField}
                        className="form-input"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          {/* Remember Me checkbox - only for sign in */}
          {!isSignUp && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-light-100 text-sm cursor-pointer">
                Remember me
              </label>
            </div>
          )}

          <Button type="submit" className="form-btn">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignUp ? "Already have an account? " : "New to BookWise? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-bold text-primary"
        >
          {isSignUp ? "Sign In" : "Create an account"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;