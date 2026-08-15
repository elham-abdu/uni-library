"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ZodSchema } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import FileUpload from "@/components/FileUpload";

interface Props<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  schema: ZodSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const isSignIn = type === "SIGN_IN";

  const form: UseFormReturn<T> = useForm<T>({
    // Using `schema as any` here breaks the generic lock between RHF and Zod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn
          ? "Welcome back to Bookwise"
          : "Create your library account"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collection of resources, and stay readied"
          : "Please complete all fields and upload a valid university ID to gain access to the library"}
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field as keyof typeof FIELD_NAMES]}
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
                          FIELD_TYPES[field as keyof typeof FIELD_TYPES]
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

          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium text-light-100">
        {isSignIn ? "New to Bookwise? " : "Already have an account? "}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;