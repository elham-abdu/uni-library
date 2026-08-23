export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "📚 Welcome to Bookwise Library!",
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
            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/library" style="display: inline-block; margin-top: 10px; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Browse Books
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">You received this email because you signed up for Bookwise.</p>
        </div>
      </div>
    `,
  }),

  borrowConfirmation: (name: string, bookTitle: string, dueDate: string) => ({
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
            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/my-profile" style="display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View My Books
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">Please return the book by the due date to avoid late fees.</p>
        </div>
      </div>
    `,
  }),

  dueReminder: (name: string, bookTitle: string, dueDate: string, daysLeft: number) => ({
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
            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/my-profile" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Return Book
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  overdue: (name: string, bookTitle: string, daysOverdue: number) => ({
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
            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/my-profile" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Return Now
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};