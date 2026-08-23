"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { signUpSchema } from "@/lib/validations";
import { signUp } from "@/lib/actions/auth";
import { AuthCredentials } from "@/types";

const defaultValues: AuthCredentials = {
  fullname: "",
  email: "",
  universityId: 0,
  password: "",
  universityCard: "",
};

const SignUp = () => {
  return (
    <AuthForm
      type="SIGN_UP"
      schema={signUpSchema}
      defaultValues={defaultValues}
      onSubmit={signUp}
    />
  );
};

export default SignUp;