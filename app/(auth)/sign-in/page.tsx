"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { signInSchema } from "@/lib/validations";

const SignIn = () => (
  <AuthForm
    type="SIGN_IN"
    schema={signInSchema}
    defaultValues={{
      email: "",
      password: "",
    }}
    onSubmit={async () => ({ success: true })}
  />
);

export default SignIn;