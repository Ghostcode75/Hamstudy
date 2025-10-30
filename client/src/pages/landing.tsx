import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, BookOpen, TrendingUp, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6">
            <Radio className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Ham Radio Technician License Test Prep
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Master the FCC Technician exam with our comprehensive study platform.
            412 questions from the 2022-2026 question pool with detailed explanations.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="px-8 py-6 text-lg"
            data-testid="button-login"
          >
            Get Started - Log In
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="hover-elevate">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Smart Study Mode</CardTitle>
              <CardDescription>
                Adaptive learning focuses on questions you need to master
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Award className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Practice Exams</CardTitle>
              <CardDescription>
                Realistic FCC format tests with instant feedback and scoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor your proficiency by topic with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Radio className="w-8 h-8 text-primary mb-2" />
              <CardTitle>412 Questions</CardTitle>
              <CardDescription>
                Complete 2022-2026 Technician question pool with explanations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>About the Technician License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Technician Class is the entry-level amateur radio license that allows you to
                operate on all VHF and UHF amateur bands, plus limited HF privileges.
              </p>
              <p>
                The exam consists of 35 questions drawn from a pool of 412 questions.
                You need to answer 26 questions correctly (74%) to pass.
              </p>
              <p className="font-medium text-foreground">
                Start your journey to becoming a licensed ham radio operator today!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
