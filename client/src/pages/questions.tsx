import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Lightbulb } from "lucide-react";
import { subelements, type Question } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Questions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubelement, setSelectedSubelement] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const filteredQuestions = questions?.filter((q) => {
    const matchesSearch = searchQuery === "" ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubelement = selectedSubelement === "all" ||
      q.subelement.startsWith(selectedSubelement);

    return matchesSearch && matchesSubelement;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Question Browser</h1>
        <p className="text-muted-foreground">
          Explore all 412 questions from the Technician question pool
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subelement</label>
                <Select value={selectedSubelement} onValueChange={setSelectedSubelement}>
                  <SelectTrigger data-testid="select-subelement">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {subelements.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.id} - {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                Showing {filteredQuestions?.length || 0} of {questions?.length || 412} questions
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : selectedQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" data-testid="text-selected-question-id">
                        {selectedQuestion.id}
                      </Badge>
                      <Badge variant="secondary">{selectedQuestion.subelement}</Badge>
                      {selectedQuestion.references && (
                        <Badge variant="outline" className="text-xs">
                          {selectedQuestion.references}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl leading-relaxed" data-testid="text-selected-question">
                      {selectedQuestion.questionText}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuestion(null)}
                    data-testid="button-close-detail"
                  >
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[
                    { key: 'A', text: selectedQuestion.answerA },
                    { key: 'B', text: selectedQuestion.answerB },
                    { key: 'C', text: selectedQuestion.answerC },
                    { key: 'D', text: selectedQuestion.answerD },
                  ].map((answer) => {
                    const isCorrect = answer.key === selectedQuestion.correctAnswer;

                    return (
                      <div
                        key={answer.key}
                        className={`rounded-lg border p-4 ${
                          isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : ''
                        }`}
                      >
                        <p className="text-base leading-relaxed">
                          <span className="font-semibold mr-2">{answer.key}.</span>
                          {answer.text}
                          {isCorrect && (
                            <Badge variant="default" className="ml-2 bg-green-600">
                              Correct Answer
                            </Badge>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-start gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                    <h3 className="font-semibold text-foreground">Explanation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-selected-explanation">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-3 pr-4">
                {filteredQuestions?.map((question) => (
                  <Card
                    key={question.id}
                    className="cursor-pointer hover-elevate active-elevate-2 transition-shadow"
                    onClick={() => setSelectedQuestion(question)}
                    data-testid={`card-question-${question.id.toLowerCase()}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.id}</Badge>
                        <Badge variant="secondary" className="text-xs">{question.subelement}</Badge>
                      </div>
                      <p className="text-base leading-relaxed text-foreground">
                        {question.questionText}
                      </p>
                    </CardHeader>
                  </Card>
                ))}

                {filteredQuestions?.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        No questions found matching your filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
