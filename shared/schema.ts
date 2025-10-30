import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questions table - Technician license questions (2022-2026 pool)
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey(), // e.g., "T1A01"
  subelement: varchar("subelement", { length: 3 }).notNull(), // e.g., "T1A"
  questionText: text("question_text").notNull(),
  answerA: text("answer_a").notNull(),
  answerB: text("answer_b").notNull(),
  answerC: text("answer_c").notNull(),
  answerD: text("answer_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(), // A, B, C, or D
  explanation: text("explanation").notNull(),
  references: text("references"), // FCC regulation references
});

// User progress table - tracks which questions users have answered and their mastery
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  timesCorrect: integer("times_correct").notNull().default(0),
  timesIncorrect: integer("times_incorrect").notNull().default(0),
  lastAttemptedAt: timestamp("last_attempted_at"),
  isMastered: boolean("is_mastered").notNull().default(false), // 3+ correct in a row
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_progress_user_idx").on(table.userId),
  index("user_progress_question_idx").on(table.questionId),
]);

// Study sessions table - tracks individual study sessions
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // 'study' or 'practice_test'
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsCorrect: integer("questions_correct").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"), // percentage for practice tests
  passed: boolean("passed"), // for practice tests (74% required)
}, (table) => [
  index("study_sessions_user_idx").on(table.userId),
]);

// Bookmarks table - tracks bookmarked questions for later review
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("bookmarks_user_idx").on(table.userId),
  index("bookmarks_question_idx").on(table.questionId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  sessions: many(studySessions),
  bookmarks: many(bookmarks),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  userProgress: many(userProgress),
  bookmarks: many(bookmarks),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [userProgress.questionId],
    references: [questions.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [bookmarks.questionId],
    references: [questions.id],
  }),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });

// TypeScript types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

// Subelement metadata for organization
export const subelements = [
  { id: 'T1', name: 'FCC Rules, Descriptions and Definitions', questionCount: 6 },
  { id: 'T2', name: 'Operating Procedures', questionCount: 3 },
  { id: 'T3', name: 'Radio Wave Characteristics', questionCount: 3 },
  { id: 'T4', name: 'Amateur Radio Practices and Station Setup', questionCount: 2 },
  { id: 'T5', name: 'Electrical Principles', questionCount: 4 },
  { id: 'T6', name: 'Electrical Components', questionCount: 4 },
  { id: 'T7', name: 'Practical Circuits', questionCount: 4 },
  { id: 'T8', name: 'Signals and Emissions', questionCount: 4 },
  { id: 'T9', name: 'Antennas and Feed Lines', questionCount: 2 },
  { id: 'T0', name: 'Electrical and RF Safety', questionCount: 3 },
] as const;
