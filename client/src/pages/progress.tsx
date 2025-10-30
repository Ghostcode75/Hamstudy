import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, AlertCircle, Award } from "lucide-react";
import { subelements } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface SubelementProgress {
  subelement: string;
  name: string;
  totalQuestions: number;
  masteredQuestions: number;
  proficiency: number;
}

interface TestHistory {
  date: string;
  score: number;
  passed: boolean;
}

export default function ProgressPage() {
  const { data: subelementProgress, isLoading: progressLoading } = useQuery<SubelementProgress[]>({
    queryKey: ["/api/dashboard/subelement-progress"],
  });

  const { data: testHistory, isLoading: historyLoading } = useQuery<TestHistory[]>({
    queryKey: ["/api/progress/test-history"],
  });

  const weakAreas = subelementProgress
    ?.filter((p) => p.proficiency < 70)
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 5);

  const strongAreas = subelementProgress
    ?.filter((p) => p.proficiency >= 90)
    .sort((a, b) => b.proficiency - a.proficiency);

  const chartData = subelementProgress?.map((p) => ({
    name: p.subelement,
    proficiency: p.proficiency,
  }));

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Detailed analytics of your learning progress and test performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Proficiency by Subelement
            </CardTitle>
            <CardDescription>Your mastery level across all exam topics</CardDescription>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="proficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No progress data yet. Start studying to see your stats!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Test Score History
            </CardTitle>
            <CardDescription>Track your practice test scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : testHistory && testHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={testHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey={() => 74}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No test history yet. Take a practice test to see your progress!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Weak Areas
            </CardTitle>
            <CardDescription>Topics that need more attention</CardDescription>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : weakAreas && weakAreas.length > 0 ? (
              <div className="space-y-4">
                {weakAreas.map((area) => (
                  <div key={area.subelement} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-foreground">{area.subelement}</span>
                        <span className="text-sm text-muted-foreground ml-2">{area.name}</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {area.proficiency}%
                      </Badge>
                    </div>
                    <Progress value={area.proficiency} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Great job! No weak areas identified. Keep up the excellent work!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600 dark:text-green-500" />
              Strong Areas
            </CardTitle>
            <CardDescription>Topics you've mastered</CardDescription>
          </CardHeader>
          <CardContent>
            {progressLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : strongAreas && strongAreas.length > 0 ? (
              <div className="space-y-4">
                {strongAreas.map((area) => (
                  <div key={area.subelement} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-foreground">{area.subelement}</span>
                        <span className="text-sm text-muted-foreground ml-2">{area.name}</span>
                      </div>
                      <Badge variant="default" className="text-xs bg-green-600">
                        {area.proficiency}%
                      </Badge>
                    </div>
                    <Progress value={area.proficiency} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keep studying to achieve 90%+ proficiency in topics!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>All subelements with question counts and mastery</CardDescription>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {subelements.map((sub) => {
                const progress = subelementProgress?.find((p) => p.subelement.startsWith(sub.id));
                const proficiency = progress?.proficiency || 0;
                const mastered = progress?.masteredQuestions || 0;

                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{sub.id}</Badge>
                        <span className="font-medium text-foreground">{sub.name}</span>
                      </div>
                      <Progress value={proficiency} className="h-2 max-w-xs" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {mastered}/{sub.questionCount} mastered
                      </p>
                      <p className="text-xs text-muted-foreground">{proficiency}% proficiency</p>
                    </div>
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
