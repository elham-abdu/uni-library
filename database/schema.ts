import {
  varchar,
  uuid,
  text,
  pgTable,
  pgEnum,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const STATUS_ENUM = pgEnum("status", ["PENDING", "APPROVED", "REJECTED"]);
export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);

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
});