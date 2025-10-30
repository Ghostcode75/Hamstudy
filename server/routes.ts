import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { subelements } from "@shared/schema";

// Temporary in-memory storage for active practice tests
const activePracticeTests = new Map<string, { sessionId: string; questions: any[]; startedAt: Date }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const allQuestions = await storage.getAllQuestions();
      const userProgressData = await storage.getUserProgress(userId);
      const sessions = await storage.getUserStudySessions(userId, 100);
      const streak = await storage.getStudyStreak(userId);

      const masteredCount = userProgressData.filter(p => p.isMastered).length;
      
      const practiceTests = sessions.filter(s => s.sessionType === 'practice_test' && s.completedAt);
      const averageScore = practiceTests.length > 0
        ? Math.round(practiceTests.reduce((sum, s) => sum + (s.score || 0), 0) / practiceTests.length)
        : 0;

      res.json({
        totalQuestions: allQuestions.length,
        questionsMastered: masteredCount,
        practiceTestsTaken: practiceTests.length,
        averageScore,
        studyStreak: streak,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/dashboard/subelement-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getSubelementProgress(userId);
      
      // Add names from subelements
      const progressWithNames = progress.map(p => {
        const subelement = subelements.find(s => p.subelement.startsWith(s.id));
        return {
          ...p,
          name: subelement?.name || p.subelement,
        };
      });

      res.json(progressWithNames);
    } catch (error) {
      console.error("Error fetching subelement progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Questions endpoints
  app.get('/api/questions', isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/study', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all questions and user progress
      const allQuestions = await storage.getAllQuestions();
      const userProgressData = await storage.getUserProgress(userId);
      
      // Create a map of question progress
      const progressMap = new Map(
        userProgressData.map(p => [p.questionId, p])
      );

      // Prioritize questions that haven't been mastered
      const unmasteredQuestions = allQuestions.filter(q => {
        const progress = progressMap.get(q.id);
        return !progress || !progress.isMastered;
      });

      // If all are mastered, use all questions
      const questionsToStudy = unmasteredQuestions.length > 0 
        ? unmasteredQuestions 
        : allQuestions;

      // Shuffle the questions
      const shuffled = questionsToStudy.sort(() => Math.random() - 0.5);
      
      res.json(shuffled);
    } catch (error) {
      console.error("Error fetching study questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // User progress
  app.post('/api/progress/submit-answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        questionId: z.string(),
        answer: z.string(),
        correct: z.boolean(),
      });
      
      const data = schema.parse(req.body);
      
      // Get current progress
      const currentProgress = await storage.getUserProgressForQuestion(userId, data.questionId);
      
      // Update progress
      const updated = await storage.updateUserProgress({
        userId,
        questionId: data.questionId,
        timesCorrect: (currentProgress?.timesCorrect || 0) + (data.correct ? 1 : 0),
        timesIncorrect: (currentProgress?.timesIncorrect || 0) + (data.correct ? 0 : 1),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.get('/api/progress/test-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserStudySessions(userId, 20);
      
      const testHistory = sessions
        .filter(s => s.sessionType === 'practice_test' && s.completedAt)
        .map(s => ({
          date: s.completedAt!.toISOString().split('T')[0],
          score: s.score || 0,
          passed: s.passed || false,
        }));

      res.json(testHistory);
    } catch (error) {
      console.error("Error fetching test history:", error);
      res.status(500).json({ message: "Failed to fetch test history" });
    }
  });

  // Practice test
  app.post('/api/practice-test/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate a practice test with 35 questions distributed across subelements
      const allQuestions = await storage.getAllQuestions();
      const selectedQuestions: any[] = [];

      // Distribution based on FCC requirements for Technician exam
      const distribution = [
        { prefix: 'T1', count: 6 },
        { prefix: 'T2', count: 3 },
        { prefix: 'T3', count: 3 },
        { prefix: 'T4', count: 2 },
        { prefix: 'T5', count: 4 },
        { prefix: 'T6', count: 4 },
        { prefix: 'T7', count: 4 },
        { prefix: 'T8', count: 4 },
        { prefix: 'T9', count: 2 },
        { prefix: 'T0', count: 3 },
      ];

      for (const dist of distribution) {
        const subelementQuestions = allQuestions.filter(q => 
          q.subelement.startsWith(dist.prefix)
        );
        
        // Randomly select the required number of questions
        const shuffled = subelementQuestions.sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffled.slice(0, dist.count));
      }

      // Shuffle the final selection
      const finalQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

      // Create study session
      const session = await storage.createStudySession({
        userId,
        sessionType: 'practice_test',
        questionsAttempted: 0,
        questionsCorrect: 0,
      });

      // Store the test in memory
      activePracticeTests.set(userId, {
        sessionId: session.id,
        questions: finalQuestions,
        startedAt: new Date(),
      });

      res.json({ 
        id: session.id,
        questions: finalQuestions,
        startedAt: session.startedAt,
      });
    } catch (error) {
      console.error("Error starting practice test:", error);
      res.status(500).json({ message: "Failed to start practice test" });
    }
  });

  app.get('/api/practice-test/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeTest = activePracticeTests.get(userId);

      if (!activeTest) {
        return res.status(404).json({ message: "No active test found" });
      }

      res.json({
        id: activeTest.sessionId,
        questions: activeTest.questions,
        startedAt: activeTest.startedAt,
      });
    } catch (error) {
      console.error("Error fetching current test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  app.post('/api/practice-test/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        answers: z.record(z.string()),
      });
      
      const data = schema.parse(req.body);
      const activeTest = activePracticeTests.get(userId);

      if (!activeTest) {
        return res.status(404).json({ message: "No active test found" });
      }

      // Calculate score
      let correctCount = 0;
      const answers = Object.entries(data.answers).map(([questionId, answer]) => {
        const question = activeTest.questions.find(q => q.id === questionId);
        const isCorrect = question && question.correctAnswer === answer;
        if (isCorrect) correctCount++;

        return {
          questionId,
          userAnswer: answer,
          correctAnswer: question?.correctAnswer || '',
          isCorrect,
        };
      });

      const totalQuestions = activeTest.questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= 74;

      // Update session
      await storage.updateStudySession(activeTest.sessionId, {
        questionsAttempted: totalQuestions,
        questionsCorrect: correctCount,
        completedAt: new Date(),
        score,
        passed,
      });

      // Clear the active test
      activePracticeTests.delete(userId);

      res.json({
        score,
        passed,
        correctCount,
        totalQuestions,
        answers,
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ message: "Failed to submit test" });
    }
  });

  // Bookmarks
  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schema = z.object({
        questionId: z.string(),
      });
      
      const data = schema.parse(req.body);
      
      const bookmark = await storage.createBookmark({
        userId,
        questionId: data.questionId,
      });

      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
