import {
  varchar,
  uuid,
  integer,
  text,
  pgTable,
  pgEnum,
  timestamp,
  date,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

export const STATUS_ENUM = pgEnum("status", ["PENDING", "APPROVED", "REJECTED"]);
export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);
export const BORROW_STATUS_ENUM = pgEnum("borrow_status", [
  "BORROWED",
  "RETURNED",
]);

export const HOLD_STATUS_ENUM = pgEnum("hold_status", [
  "PENDING",
  "READY",
  "FULFILLED",
  "EXPIRED",
  "CANCELLED",
]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  universityId: varchar("university_id", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  universityCard: text("university_card").notNull(),
  status: STATUS_ENUM("status").default("PENDING").notNull(),
  role: ROLE_ENUM("role").default("USER").notNull(),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  borrowConfirmationEmails: boolean("borrow_confirmation_emails")
    .default(true)
    .notNull(),
  returnConfirmationEmails: boolean("return_confirmation_emails")
    .default(true)
    .notNull(),
  dueReminderEmails: boolean("due_reminder_emails").default(true).notNull(),
  promotionalEmails: boolean("promotional_emails").default(false).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  theme: varchar("theme", { length: 10 }).default("dark"),
});

export const books = pgTable("books", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  genre: text("genre").notNull(),
  rating: numeric("rating").notNull(),
  coverUrl: text("cover_url").notNull(),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
  description: text("description").notNull(),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  videoUrl: text("video_url").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const borrowRecords = pgTable("borrow_records", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  borrowDate: timestamp("borrow_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: BORROW_STATUS_ENUM("status").default("BORROWED").notNull(),
  renewalCount: integer("renewal_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const bookHolds = pgTable("book_holds", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  status: HOLD_STATUS_ENUM("status").default("PENDING").notNull(),
  queuePosition: integer("queue_position").notNull(),
  placedAt: timestamp("placed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type BorrowRecord = typeof borrowRecords.$inferSelect;
export type BookHold = typeof bookHolds.$inferSelect;
export type NewBookHold = typeof bookHolds.$inferInsert;
// ✅ READING LIST STATUS ENUM
export const READING_LIST_STATUS_ENUM = pgEnum("reading_list_status", [
  "WANT_TO_READ",
  "CURRENTLY_READING",
  "FINISHED",
]);

// ✅ READING LISTS TABLE
export const readingLists = pgTable("reading_lists", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  status: READING_LIST_STATUS_ENUM("status").default("WANT_TO_READ").notNull(),
  notes: text("notes"), // Optional personal notes
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type ReadingList = typeof readingLists.$inferSelect;
export type NewReadingList = typeof readingLists.$inferInsert;
// ✅ REVIEWS TABLE
export const reviews = pgTable("reviews", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => books.id)
    .notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 200 }),
  body: text("body").notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ✅ HELPFUL VOTES TABLE
export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .references(() => reviews.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewVote = typeof reviewVotes.$inferSelect;