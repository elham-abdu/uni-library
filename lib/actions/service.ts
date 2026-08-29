import { Resend } from "resend";
import config from "@/lib/config";

// Log if token exists
console.log("🔑 RESEND_TOKEN exists:", !!process.env.RESEND_TOKEN);
console.log("🔑 RESEND_TOKEN length:", process.env.RESEND_TOKEN?.length || 0);

const resend = process.env.RESEND_TOKEN ? new Resend(process.env.RESEND_TOKEN) : null;

export const sendWelcomeEmail = async (email: string, name: string) => {
  console.log("📧 sendWelcomeEmail called for:", email);
  console.log("📧 Resend instance:", resend ? "exists" : "null");

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
    console.log("📧 Sending welcome email...");
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Bookwise! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #8b5cf6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 Bookwise</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Welcome ${name}! 🎉</h2>
            <p style="color: #666; line-height: 1.6;">We're thrilled to have you join Bookwise. Explore our university library catalog to borrow your first book.</p>
            <div style="margin: 30px 0; padding: 20px; background: #f0f0f0; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #333;">Start exploring now:</p>
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'}/library" style="display: inline-block; margin-top: 10px; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Browse Books
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">You received this email because you signed up for Bookwise.</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Welcome email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send welcome email error:", error);
    return { success: false, error: String(error) };
  }
};

export const sendBorrowConfirmation = async (
  email: string,
  name: string,
  bookTitle: string,
  dueDate: string
) => {
  console.log("📧 sendBorrowConfirmation called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `📖 Book Borrowed: ${bookTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #8b5cf6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 Bookwise</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">You have successfully borrowed <strong>"${bookTitle}"</strong>.</p>
            <div style="margin: 30px 0; padding: 20px; background: #f0f0f0; border-radius: 8px;">
              <p style="margin: 5px 0; color: #333;"><strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #333;"><strong>⏰ Days Left:</strong> 14 days</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'}/my-profile" style="display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View My Books
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">Please return the book by the due date to avoid late fees.</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Borrow confirmation sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send borrow confirmation error:", error);
    return { success: false, error: String(error) };
  }
};

export const sendReturnConfirmation = async (
  email: string,
  name: string,
  bookTitle: string
) => {
  console.log("📧 sendReturnConfirmation called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `✅ Book Returned: ${bookTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Book Returned</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">You have successfully returned <strong>"${bookTitle}"</strong>.</p>
            <div style="margin: 30px 0; padding: 20px; background: #f0f0f0; border-radius: 8px;">
              <p style="margin: 5px 0; color: #333;">✅ Thank you for returning the book on time!</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'}/library" style="display: inline-block; padding: 12px 30px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Browse More Books
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">Thank you for being a responsible reader! 📚</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Return confirmation sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send return confirmation error:", error);
    return { success: false, error: String(error) };
  }
};

export const sendDueReminder = async (
  email: string,
  name: string,
  bookTitle: string,
  dueDate: string,
  daysLeft: number
) => {
  console.log("📧 sendDueReminder called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `⏰ Reminder: "${bookTitle}" is due in ${daysLeft} days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⏰ Reminder</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">This is a friendly reminder that your borrowed book <strong>"${bookTitle}"</strong> is due in <strong style="color: #f59e0b;">${daysLeft} days</strong>.</p>
            <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0; color: #333;"><strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'}/my-profile" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Return Book
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">Please return the book on time to avoid late fees.</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Due reminder sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send due reminder error:", error);
    return { success: false, error: String(error) };
  }
};

export const sendOverdueEmail = async (
  email: string,
  name: string,
  bookTitle: string,
  daysOverdue: number
) => {
  console.log("📧 sendOverdueEmail called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `⚠️ OVERDUE: "${bookTitle}" is ${daysOverdue} days overdue`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #ef4444; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Overdue Notice</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">Your borrowed book <strong>"${bookTitle}"</strong> is <strong style="color: #ef4444;">${daysOverdue} days overdue</strong>.</p>
            <div style="margin: 30px 0; padding: 20px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="margin: 5px 0; color: #333;"><strong>⚠️ Please return the book immediately to avoid further penalties.</strong></p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000'}/my-profile" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Return Now
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">Late returns may result in library fines.</p>
          </div>
        </div>
      `,
    });

    console.log("📧 Overdue email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send overdue email error:", error);
    return { success: false, error: String(error) };
  }
};