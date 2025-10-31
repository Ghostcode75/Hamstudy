import {
  users,
  questions,
  userProgress,
  studySessions,
  bookmarks,
  type User,
  type UpsertUser,
  type Question,
  type InsertQuestion,
  type UserProgress,
  type InsertUserProgress,
  type StudySession,
  type InsertStudySession,
  type Bookmark,
  type InsertBookmark,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lte } from "drizzle-orm";
import { calculateNextReview, determineQuality, isDueForReview } from "./spacedRepetition";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Question operations
  getAllQuestions(): Promise<Question[]>;
  getQuestionsBySubelement(subelement: string): Promise<Question[]>;
  getRandomQuestions(count: number): Promise<Question[]>;
  seedQuestions(questions: InsertQuestion[]): Promise<void>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForQuestion(userId: string, questionId: string): Promise<UserProgress | undefined>;
  updateUserProgress(data: InsertUserProgress): Promise<UserProgress>;
  getSubelementProgress(userId: string): Promise<Array<{
    subelement: string;
    totalQuestions: number;
    masteredQuestions: number;
    proficiency: number;
  }>>;

  // Study session operations
  createStudySession(data: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: string, data: Partial<InsertStudySession>): Promise<StudySession>;
  getUserStudySessions(userId: string, limit?: number): Promise<StudySession[]>;
  getStudyStreak(userId: string): Promise<number>;

  // Bookmark operations
  createBookmark(data: InsertBookmark): Promise<Bookmark>;
  getUserBookmarks(userId: string): Promise<Array<Bookmark & { question: Question }>>;
  deleteBookmark(userId: string, questionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Question operations
  async getAllQuestions(): Promise<Question[]> {
    return db.select().from(questions).orderBy(questions.id);
  }

  async getQuestionsBySubelement(subelement: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.subelement, subelement));
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    const result = await db
      .select()
      .from(questions)
      .orderBy(sql`RANDOM()`)
      .limit(count);
    return result;
  }

  async seedQuestions(questionData: InsertQuestion[]): Promise<void> {
    if (questionData.length === 0) return;
    
    await db.insert(questions).values(questionData).onConflictDoNothing();
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressForQuestion(userId: string, questionId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.questionId, questionId)));
    return progress;
  }

  async updateUserProgress(data: InsertUserProgress & { isCorrect?: boolean }): Promise<UserProgress> {
    const existing = await this.getUserProgressForQuestion(data.userId, data.questionId);

    if (existing) {
      const timesCorrect = data.timesCorrect !== undefined ? data.timesCorrect : existing.timesCorrect;
      const timesIncorrect = data.timesIncorrect !== undefined ? data.timesIncorrect : existing.timesIncorrect;
      
      // Calculate consecutive correct answers for SM-2
      let consecutiveCorrect = existing.timesCorrect;
      if (data.isCorrect !== undefined) {
        consecutiveCorrect = data.isCorrect ? timesCorrect : 0;
      }
      
      // Use SM-2 algorithm to calculate next review
      const quality = data.isCorrect !== undefined ? determineQuality(data.isCorrect) : 3;
      const srResult = calculateNextReview(
        quality,
        existing.easeFactor,
        existing.interval,
        consecutiveCorrect
      );

      const [updated] = await db
        .update(userProgress)
        .set({
          timesCorrect,
          timesIncorrect,
          isMastered: srResult.isMastered,
          easeFactor: srResult.easeFactor,
          interval: srResult.interval,
          nextReviewDate: srResult.nextReviewDate,
          lastAttemptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      // New question for user
      const isCorrect = data.isCorrect !== undefined ? data.isCorrect : (data.timesCorrect || 0) > 0;
      const quality = determineQuality(isCorrect);
      const srResult = calculateNextReview(quality, 250, 0, isCorrect ? 1 : 0);
      
      const [created] = await db.insert(userProgress).values({
        userId: data.userId,
        questionId: data.questionId,
        timesCorrect: data.timesCorrect || 0,
        timesIncorrect: data.timesIncorrect || 0,
        isMastered: srResult.isMastered,
        easeFactor: srResult.easeFactor,
        interval: srResult.interval,
        nextReviewDate: srResult.nextReviewDate,
        lastAttemptedAt: new Date(),
      }).returning();
      return created;
    }
  }

  async getSubelementProgress(userId: string): Promise<Array<{
    subelement: string;
    totalQuestions: number;
    masteredQuestions: number;
    proficiency: number;
  }>> {
    const result = await db
      .select({
        subelement: questions.subelement,
        totalQuestions: sql<number>`COUNT(DISTINCT ${questions.id})`.as('total_questions'),
        masteredQuestions: sql<number>`COUNT(DISTINCT CASE WHEN ${userProgress.isMastered} THEN ${userProgress.questionId} END)`.as('mastered_questions'),
      })
      .from(questions)
      .leftJoin(
        userProgress,
        and(
          eq(questions.id, userProgress.questionId),
          eq(userProgress.userId, userId)
        )
      )
      .groupBy(questions.subelement);

    return result.map(row => ({
      subelement: row.subelement,
      totalQuestions: Number(row.totalQuestions),
      masteredQuestions: Number(row.masteredQuestions),
      proficiency: row.totalQuestions > 0 
        ? Math.round((Number(row.masteredQuestions) / Number(row.totalQuestions)) * 100)
        : 0,
    }));
  }

  // Study session operations
  async createStudySession(data: InsertStudySession): Promise<StudySession> {
    const [session] = await db.insert(studySessions).values(data).returning();
    return session;
  }

  async updateStudySession(id: string, data: Partial<InsertStudySession>): Promise<StudySession> {
    const [session] = await db
      .update(studySessions)
      .set(data)
      .where(eq(studySessions.id, id))
      .returning();
    return session;
  }

  async getUserStudySessions(userId: string, limit: number = 10): Promise<StudySession[]> {
    return db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startedAt))
      .limit(limit);
  }

  async getStudyStreak(userId: string): Promise<number> {
    const sessions = await db
      .select({
        startedAt: studySessions.startedAt,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.startedAt));

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.startedAt!);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Bookmark operations
  async createBookmark(data: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db.insert(bookmarks).values(data).returning();
    return bookmark;
  }

  async getUserBookmarks(userId: string): Promise<Array<Bookmark & { question: Question }>> {
    const result = await db
      .select()
      .from(bookmarks)
      .leftJoin(questions, eq(bookmarks.questionId, questions.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));

    return result.map(row => ({
      ...row.bookmarks,
      question: row.questions!,
    }));
  }

  async deleteBookmark(userId: string, questionId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)));
  }
}

export const storage = new DatabaseStorage();
