'use client';

import { useState, useEffect } from 'react';
import { getQuizByAccessCode, gradeQuiz, submitQuizResult } from '@/lib/firebase-helpers';
import type { Quiz, Question, StudentAnswer, QuizResult } from '@/lib/types';
import { QuizResults } from '@/components/quiz-results';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface TestTakerProps {
  onBack: () => void;
  initialName?: string;
  initialCode?: string;
}

type Phase = 'join' | 'quiz' | 'results';

export function TestTaker({ onBack, initialName = '', initialCode = '' }: TestTakerProps) {
  const [phase, setPhase] = useState<Phase>('join');

  // Join state
  const [studentName, setStudentName] = useState(initialName);
  const [accessCode, setAccessCode] = useState(initialCode);
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  // Initialize if passed from auth flow wrapper
  useEffect(() => {
      if (initialName && initialCode && phase === 'join') {
          handleJoin(initialName, initialCode);
      }
  }, []);

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Results state
  const [result, setResult] = useState<QuizResult | null>(null);

  // ─── Join Handler ──────────────────────────────────────────
  const handleJoin = async (overrideName?: string, overrideCode?: string) => {
    const name = overrideName || studentName;
    const code = overrideCode || accessCode;

    if (!name.trim()) {
      setJoinError('Please enter your name.');
      return;
    }
    if (!code.trim()) {
      setJoinError('Please enter an access code.');
      return;
    }

    setJoining(true);
    setJoinError('');

    try {
      const found = await getQuizByAccessCode(code.trim().toUpperCase());
      if (!found) {
        setJoinError('Invalid access code. Please check and try again.');
        return;
      }
      if (found.questions.length === 0) {
        setJoinError('This quiz has no questions yet. Please contact your instructor.');
        return;
      }
      setQuiz(found);
      setPhase('quiz');
    } catch (err) {
      console.error('Error joining quiz:', err);
      setJoinError('Something went wrong. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  // ─── Answer Handler ────────────────────────────────────────
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ─── Submit Handler ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const studentAnswers = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));

      const graded = gradeQuiz(quiz.questions, studentAnswers);

      const resultData: Omit<QuizResult, 'id'> = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        subjectId: quiz.subjectId,
        studentName: studentName.trim(),
        answers: graded.gradedAnswers,
        score: graded.score,
        totalPoints: graded.totalPoints,
        percentage: graded.percentage,
        submittedAt: Date.now(),
      };

      const resultId = await submitQuizResult(resultData);
      setResult({ id: resultId, ...resultData });
      setPhase('results');
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Retry Handler ─────────────────────────────────────────
  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setPhase('quiz');
  };

  // ─── JOIN PHASE ────────────────────────────────────────────
  if (phase === 'join') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-background dark:via-background dark:to-background p-4">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-200/30 dark:bg-sky-900/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-200/30 dark:bg-teal-900/20 blur-3xl" />

        <div className="relative w-full max-w-md space-y-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>

          <Card className="border-0 shadow-xl dark:border dark:border-border">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-bold">Join a Quiz</CardTitle>
              <CardDescription className="text-base">
                Enter your name and the access code from your instructor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {joinError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-300">{joinError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-11"
                  disabled={joining}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Access Code
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. ABC123"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="h-11 text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={joining}
                />
              </div>

              <Button
                onClick={() => handleJoin()}
                disabled={joining || !studentName.trim() || !accessCode.trim()}
                className="h-12 w-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90"
              >
                {joining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding quiz...
                  </>
                ) : (
                  'Join Quiz'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ─────────────────────────────────────────
  if (phase === 'results' && result && quiz) {
    return (
      <QuizResults
        result={result}
        questions={quiz.questions}
        showFeedback={quiz.showFeedback}
        allowRetry={quiz.allowRetry}
        onRetry={handleRetry}
        onHome={onBack}
      />
    );
  }

  // ─── QUIZ PHASE (Wizard) ───────────────────────────────────
  if (!quiz) return null;

  const questions = quiz.questions;
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const currentAnswer = answers[currentQ.id] || '';
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-background dark:via-background dark:to-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-sky-500" />
            <span className="font-semibold text-foreground">{quiz.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Question area */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Question number badge */}
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-sky-100 dark:bg-sky-900/40 px-4 py-1 text-sm font-medium text-sky-700 dark:text-sky-300">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Question card */}
          <Card className="border-0 shadow-xl dark:border dark:border-border">
            <CardContent className="p-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold leading-relaxed text-foreground sm:text-2xl">
                  {currentQ.text}
                </h2>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">{currentQ.points} points</p>

              {/* Multiple Choice */}
              {currentQ.type === 'multiple-choice' && currentQ.options && (
                <RadioGroup
                  value={currentAnswer}
                  onValueChange={(v) => handleAnswer(currentQ.id, v)}
                  className="space-y-3"
                >
                  {currentQ.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${currentAnswer === opt.id
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40'
                          : 'border-border hover:border-border hover:bg-accent'
                        }`}
                      onClick={() => handleAnswer(currentQ.id, opt.id)}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${currentAnswer === opt.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground'
                          }`}
                      >
                        {currentAnswer === opt.id ? '✓' : ''}
                      </div>
                      <Label
                        htmlFor={opt.id}
                        className="flex-1 cursor-pointer text-base font-normal text-foreground"
                      >
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Text Input */}
              {currentQ.type === 'text-input' && (
                <Input
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  className="h-14 text-lg"
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
                className="gap-2 bg-emerald-600 text-white px-8 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex(Math.min(totalQuestions - 1, currentIndex + 1))}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Question dots nav */}
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id]?.trim();
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${isCurrent
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-2 ring-offset-background'
                      : isAnswered
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
