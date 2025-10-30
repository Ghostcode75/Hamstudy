import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileQuestion, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { subelements } from "@shared/schema";

interface DashboardStats {
  totalQuestions: number;
  questionsMastered: number;
  practiceTestsTaken: number;
  averageScore: number;
  studyStreak: number;
}

interface SubelementProgress {
  subelement: string;
  name: string;
  totalQuestions: number;
  masteredQuestions: number;
  proficiency: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: subelementProgress, isLoading: progressLoading } = useQuery<SubelementProgress[]>({
    queryKey: ["/api/dashboard/subelement-progress"],
  });

  const masteryPercentage = stats ? Math.round((stats.questionsMastered / stats.totalQuestions) * 100) : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and continue your journey to ham radio mastery</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card data-testid="card-questions-mastered">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Mastered</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-mastered-count">
                  {stats?.questionsMastered || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.totalQuestions || 412} total
                </p>
                <Progress value={masteryPercentage} className="mt-3" />
              </CardContent>
            </Card>

            <Card data-testid="card-practice-tests">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Tests</CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-practice-count">
                  {stats?.practiceTestsTaken || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  tests completed
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-average-score">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-average-score">
                  {stats?.averageScore || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.averageScore && stats.averageScore >= 74 ? 'Passing grade!' : 'Keep practicing'}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-study-streak">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-streak-count">
                  {stats?.studyStreak || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  days in a row
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-elevate active-elevate-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Continue Studying
            </CardTitle>
            <CardDescription>
              Smart study mode adapts to your learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" data-testid="button-continue-study">
              <Link href="/study">Start Study Session</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-primary" />
              Take Practice Test
            </CardTitle>
            <CardDescription>
              35 questions in realistic FCC exam format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" data-testid="button-start-practice">
              <Link href="/practice">Start Practice Test</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proficiency by Topic</CardTitle>
          <CardDescription>
            Your mastery level for each subelement of the Technician exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {subelements.map((sub) => {
                const progress = subelementProgress?.find(p => p.subelement.startsWith(sub.id));
                const proficiency = progress?.proficiency || 0;
                
                return (
                  <div key={sub.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-foreground">{sub.id}</span>
                        <span className="text-sm text-muted-foreground ml-2">{sub.name}</span>
                      </div>
                      <span className="text-sm font-medium" data-testid={`text-proficiency-${sub.id.toLowerCase()}`}>
                        {proficiency}%
                      </span>
                    </div>
                    <Progress value={proficiency} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
