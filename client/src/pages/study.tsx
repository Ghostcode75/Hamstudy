import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, BookmarkPlus, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Question } from "@shared/schema";

export default function Study() {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/study"],
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { questionId: string; answer: string; correct: boolean }) => {
      await apiRequest("POST", "/api/progress/submit-answer", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/subelement-progress"] });
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
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await apiRequest("POST", "/api/bookmarks", { questionId });
    },
    onSuccess: () => {
      toast({
        title: "Bookmarked",
        description: "Question added to your bookmarks",
      });
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
        description: "Failed to bookmark question",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];

  useEffect(() => {
    setSelectedAnswer("");
    setShowExplanation(false);
    setHasAnswered(false);
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setHasAnswered(true);
    setShowExplanation(true);

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      correct: isCorrect,
    });
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleBookmark = () => {
    if (currentQuestion) {
      bookmarkMutation.mutate(currentQuestion.id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No questions available for study.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answers = [
    { key: 'A', text: currentQuestion?.answerA },
    { key: 'B', text: currentQuestion?.answerB },
    { key: 'C', text: currentQuestion?.answerC },
    { key: 'D', text: currentQuestion?.answerD },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Mode</h1>
          <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <Badge variant="secondary" data-testid="badge-subelement">
          {currentQuestion?.subelement}
        </Badge>
      </div>

      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" data-testid="text-question-id">{currentQuestion?.id}</Badge>
                {currentQuestion?.references && (
                  <Badge variant="outline" className="text-xs">{currentQuestion.references}</Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-relaxed" data-testid="text-question">
                {currentQuestion?.questionText}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              data-testid="button-bookmark"
            >
              <BookmarkPlus className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {answers.map((answer) => {
                const isCorrectAnswer = answer.key === currentQuestion?.correctAnswer;
                const isSelected = answer.key === selectedAnswer;
                const showCorrect = hasAnswered && isCorrectAnswer;
                const showIncorrect = hasAnswered && isSelected && !isCorrectAnswer;

                return (
                  <div
                    key={answer.key}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                      isSelected && !hasAnswered && "border-primary bg-primary/5",
                      showCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                      showIncorrect && "border-red-500 bg-red-50 dark:bg-red-950"
                    )}
                  >
                    <RadioGroupItem
                      value={answer.key}
                      id={answer.key}
                      disabled={hasAnswered}
                      data-testid={`radio-answer-${answer.key.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={answer.key}
                      className={cn(
                        "flex-1 cursor-pointer text-base leading-relaxed",
                        hasAnswered && "cursor-default"
                      )}
                    >
                      <span className="font-semibold mr-2">{answer.key}.</span>
                      {answer.text}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {!hasAnswered && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full"
              data-testid="button-submit-answer"
            >
              Submit Answer
            </Button>
          )}

          {showExplanation && currentQuestion && (
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                <h3 className="font-semibold text-foreground">Explanation</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-explanation">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {hasAnswered && (
          <Button onClick={handleNext} data-testid="button-next">
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
