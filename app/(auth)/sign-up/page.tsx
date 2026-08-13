"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { signUpSchema } from "@/lib/validations";

const SignUp = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      fullname: "",
      email: "",
      universityId: 0,
      password: "",
      universityCard: "",
    }}
    onSubmit={async () => ({ success: true })}
  />
);

export default SignUp;