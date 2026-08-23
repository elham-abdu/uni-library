"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { signInSchema } from "@/lib/validations";
import { signInWithCredentials } from "@/lib/actions/auth";

const SignIn = () => {
  // Load saved credentials directly when initializing state
  const getDefaultValues = () => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("rememberedEmail");
      const savedPassword = localStorage.getItem("rememberedPassword");
      if (savedEmail && savedPassword) {
        return {
          email: savedEmail,
          password: savedPassword,
        };
      }
    }
    return {
      email: "",
      password: "",
    };
  };

  const defaultValues = getDefaultValues();

  return (
    <AuthForm
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={defaultValues}
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignIn;