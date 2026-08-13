"use client";

import React from "react";
import {
  ControllerRenderProps,
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";

interface Props<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<T, any, any>;
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

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data: T) => {
    const result = await onSubmit(data);

    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to BookWise" : "Create Your Library Account"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collection of resources, and stay informed"
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
              render={({
                field: formField,
              }: {
                field: ControllerRenderProps<T, Path<T>>;
              }) => (
                <FormItem>
                  <FormLabel className="capitalize text-light-100">
                    {FIELD_NAMES[field as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={FIELD_TYPES[field as keyof typeof FIELD_TYPES]}
                      {...formField}
                      className="form-input"
                    />
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

      <p className="text-center text-base font-medium text-light-100 mt-4">
        {isSignIn ? "New to BookWise? " : "Have an account already? "}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary hover:underline"
        >
          {isSignIn ? "Create an account" : "Login"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;