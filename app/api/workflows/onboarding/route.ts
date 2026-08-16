import { serve } from "@upstash/workflow/nextjs";
import { Resend } from "resend";
import config from "@/lib/config";

const resend = new Resend(config.env.resendToken);

interface InitialData {
  email: string;
  fullName: string;
}

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Step 1: Send Welcome Email immediately upon sign-up
  await context.run("send-welcome-email", async () => {
    await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Bookwise Library!",
      html: `<h1>Welcome ${fullName}!</h1><p>We're thrilled to have you join Bookwise. Explore our university library catalog to borrow your first book.</p>`,
    });
  });

  // Step 2: Delay for 3 days before follow-up
  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  // Step 3: Send Follow-up Email
  await context.run("send-followup-email", async () => {
    await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: "Discover New Books on Bookwise",
      html: `<p>Hi ${fullName}, have you had a chance to check out our latest arrivals?</p>`,
    });
  });
});