import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Question } from "@shared/schema";
import { Link } from "wouter";

interface PracticeTest {
  id: string;
  questions: Question[];
  startedAt: string;
}

interface TestResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export default function Practice() {
  const { toast } = useToast();
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const { data: test, isLoading } = useQuery<PracticeTest>({
    queryKey: ["/api/practice-test/current"],
    enabled: testStarted,
  });

  const startTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/practice-test/start", {});
      return response;
    },
    onSuccess: () => {
      setTestStarted(true);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setTimeElapsed(0);
      queryClient.invalidateQueries({ queryKey: ["/api/practice-test/current"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start practice test",
        variant: "destructive",
      });
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, string> }) => {
      const response = await apiRequest("POST", "/api/practice-test/submit", data);
      return response as TestResult;
    },
    onSuccess: (result) => {
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit test",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!testStarted || showResults) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [testStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = () => {
    submitTestMutation.mutate({ answers });
  };

  const currentQuestion = test?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const result = submitTestMutation.data;

  if (!testStarted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Practice Test</h1>
            <p className="text-muted-foreground">
              Take a realistic FCC Technician exam with 35 questions
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
              <CardDescription>What to expect on the practice test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Questions</p>
                  <p className="text-2xl font-bold">35</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Passing Score</p>
                  <p className="text-2xl font-bold">74%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Required Correct</p>
                  <p className="text-2xl font-bold">26/35</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Time Limit</p>
                  <p className="text-2xl font-bold">None</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • Questions are randomly selected from the official 2022-2026 question pool
                </p>
                <p>
                  • Each subelement is represented according to FCC requirements
                </p>
                <p>
                  • You can navigate between questions and change answers before submitting
                </p>
                <p>
                  • Results will show your score and detailed breakdown by topic
                </p>
              </div>

              <Button
                onClick={() => startTestMutation.mutate()}
                disabled={startTestMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-start-test"
              >
                {startTestMutation.isPending ? "Starting Test..." : "Start Practice Test"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            {result.passed ? (
              <Award className="w-10 h-10 text-primary" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className="text-4xl font-bold" data-testid="text-result-status">
            {result.passed ? "Congratulations! You Passed!" : "Keep Practicing"}
          </h1>
          <p className="text-xl text-muted-foreground">
            You scored {result.score}% ({result.correctCount}/{result.totalQuestions})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" data-testid="text-final-score">{result.score}%</p>
              <Progress value={result.score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                {result.correctCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">out of {result.totalQuestions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatTime(timeElapsed)}</p>
              <p className="text-sm text-muted-foreground mt-1">total time</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => {
              setTestStarted(false);
              setShowResults(false);
            }}
            className="flex-1"
            data-testid="button-try-again"
          >
            Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/" data-testid="link-dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !test) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  const questionAnswers = [
    { key: 'A', text: currentQuestion?.answerA },
    { key: 'B', text: currentQuestion?.answerB },
    { key: 'C', text: currentQuestion?.answerC },
    { key: 'D', text: currentQuestion?.answerD },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Test</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2" data-testid="badge-timer">
            <Clock className="w-3 h-3" />
            {formatTime(timeElapsed)}
          </Badge>
          <Badge variant="secondary" data-testid="badge-answered-count">
            {answeredCount}/{test.questions.length} answered
          </Badge>
        </div>
      </div>

      <Progress value={((currentQuestionIndex + 1) / test.questions.length) * 100} className="h-2" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" data-testid="text-question-id">{currentQuestion?.id}</Badge>
            <Badge variant="secondary">{currentQuestion?.subelement}</Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed" data-testid="text-question">
            {currentQuestion?.questionText}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <RadioGroup
            value={answers[currentQuestion?.id || ""] || ""}
            onValueChange={(value) => currentQuestion && handleAnswerSelect(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {questionAnswers.map((answer) => {
                const isSelected = answers[currentQuestion?.id || ""] === answer.key;

                return (
                  <div
                    key={answer.key}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors hover-elevate",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem
                      value={answer.key}
                      id={`q${currentQuestionIndex}-${answer.key}`}
                      data-testid={`radio-answer-${answer.key.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={`q${currentQuestionIndex}-${answer.key}`}
                      className="flex-1 cursor-pointer text-base leading-relaxed"
                    >
                      <span className="font-semibold mr-2">{answer.key}.</span>
                      {answer.text}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-8 gap-2">
        {test.questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentQuestionIndex;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={cn(
                "aspect-square rounded-md border text-sm font-medium transition-colors",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                !isCurrent && isAnswered && "bg-green-100 dark:bg-green-950 border-green-500",
                !isCurrent && !isAnswered && "hover-elevate"
              )}
              data-testid={`button-question-nav-${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        {answeredCount === test.questions.length && (
          <Button
            onClick={handleSubmitTest}
            disabled={submitTestMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-submit-test"
          >
            {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
          </Button>
        )}
      </div>
    </div>
  );
}
