import { Resend } from "resend";
import config from "@/lib/config";

// Log if token exists
console.log("🔑 RESEND_TOKEN exists:", !!process.env.RESEND_TOKEN);
console.log("🔑 RESEND_TOKEN length:", process.env.RESEND_TOKEN?.length || 0);

const resend = process.env.RESEND_TOKEN ? new Resend(process.env.RESEND_TOKEN) : null;

export const sendWelcomeEmail = async (email: string, name: string) => {
  console.log("📧 sendWelcomeEmail called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured - missing API key");
    return { success: false, error: "Resend not configured" };
  }

  try {
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
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send overdue email error:", error);
    return { success: false, error: String(error) };
  }
};
export const sendHoldReadyEmail = async (
  email: string,
  name: string,
  bookTitle: string,
  expiresAt: Date
) => {
  console.log("📧 sendHoldReadyEmail called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `📚 Good news! "${bookTitle}" is ready for you`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #22c55e; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 Book Ready!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Great news! The book you reserved, <strong>"${bookTitle}"</strong>, is now available.
            </p>
            <div style="margin: 30px 0; padding: 20px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="margin: 5px 0; color: #333;">
                <strong>⏰ Pick it up by:</strong> ${expiresAt.toLocaleString()}
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                You have 24 hours to borrow this book. After that, it will be offered to the next person in line.
              </p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000"}/my-profile" style="display: inline-block; padding: 12px 30px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Borrow Now
              </a>
            </div>
          </div>
        </div>
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send hold-ready email error:", error);
    return { success: false, error: String(error) };
  }
};
// ✅ Renewal Confirmation Email
export const sendRenewalConfirmation = async (
  email: string,
  name: string,
  bookTitle: string,
  newDueDate: string,
  renewalCount: number
) => {
  console.log("📧 sendRenewalConfirmation called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `🔄 Book Renewed: ${bookTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #3b82f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🔄 Book Renewed</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your loan for <strong>"${bookTitle}"</strong> has been successfully renewed.
            </p>
            <div style="margin: 30px 0; padding: 20px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 5px 0; color: #333;">
                <strong>📅 New Due Date:</strong> ${new Date(newDueDate).toLocaleDateString()}
              </p>
              <p style="margin: 5px 0; color: #333;">
                <strong>🔄 Renewals Used:</strong> ${renewalCount} of 2
              </p>
              ${
                renewalCount < 2
                  ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">You have ${
                      2 - renewalCount
                    } renewal remaining.</p>`
                  : `<p style="margin: 5px 0; color: #ef4444; font-size: 14px;"><strong>⚠️ This was your final renewal.</strong></p>`
              }
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000"}/my-profile" style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View My Books
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              Please return the book by the new due date to avoid late fees.
            </p>
          </div>
        </div>
      `,
    });

    console.log("📧 Renewal confirmation email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send renewal confirmation error:", error);
    return { success: false, error: String(error) };
  }
};

// ✅ Hold Confirmation Email
export const sendHoldConfirmation = async (
  email: string,
  name: string,
  bookTitle: string,
  queuePosition: number
) => {
  console.log("📧 sendHoldConfirmation called for:", email);

  if (!resend) {
    console.error("❌ Resend not configured");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "Bookwise <onboarding@resend.dev>",
      to: [email],
      subject: `📚 Hold Placed: ${bookTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #8b5cf6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📚 Hold Placed</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Hi ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your hold for <strong>"${bookTitle}"</strong> has been placed successfully.
            </p>
            <div style="margin: 30px 0; padding: 20px; background: #ede9fe; border-radius: 8px; border-left: 4px solid #8b5cf6; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your position in queue</p>
              <p style="margin: 10px 0 0 0; color: #8b5cf6; font-size: 36px; font-weight: bold;">
                #${queuePosition}
              </p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              We&apos;ll send you an email as soon as the book becomes available. You&apos;ll then have <strong>24 hours</strong> to borrow it.
            </p>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000"}/my-profile" style="display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View My Holds
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              You can cancel this hold anytime from your profile.
            </p>
          </div>
        </div>
      `,
    });

    console.log("📧 Hold confirmation email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Send hold confirmation error:", error);
    return { success: false, error: String(error) };
  }
};