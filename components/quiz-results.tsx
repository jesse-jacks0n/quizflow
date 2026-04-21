'use client';

import type { QuizResult, Question, StudentAnswer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    CheckCircle2,
    XCircle,
    Home,
    RotateCcw,
    Target,
    Sparkles,
} from 'lucide-react';

interface QuizResultsProps {
    result: QuizResult;
    questions: Question[];
    showFeedback: boolean;
    allowRetry: boolean;
    onRetry: () => void;
    onHome: () => void;
}

export function QuizResults({
    result,
    questions,
    showFeedback,
    allowRetry,
    onRetry,
    onHome,
}: QuizResultsProps) {
    const { score, totalPoints, percentage, answers } = result;

    const getGrade = () => {
        if (percentage >= 90) return { label: 'Excellent!', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Trophy className="h-8 w-8 text-emerald-500" /> };
        if (percentage >= 80) return { label: 'Great Job!', color: 'text-sky-600', bg: 'bg-sky-50', icon: <Sparkles className="h-8 w-8 text-sky-500" /> };
        if (percentage >= 60) return { label: 'Good Effort!', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Target className="h-8 w-8 text-amber-500" /> };
        return { label: 'Keep Trying!', color: 'text-rose-600', bg: 'bg-rose-50', icon: <Target className="h-8 w-8 text-rose-500" /> };
    };

    const grade = getGrade();

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-8">
                {/* Score Card */}
                <Card className={`border-0 shadow-xl overflow-hidden`}>
                    <div className={`${grade.bg} px-8 py-10 text-center`}>
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                            {grade.icon}
                        </div>
                        <h1 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h1>
                        <p className="mt-2 text-slate-500">
                            Thanks for completing the quiz, <span className="font-semibold">{result.studentName}</span>!
                        </p>
                    </div>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-3xl font-bold text-slate-900">{score}</p>
                                <p className="text-sm text-slate-500">Points Earned</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900">{totalPoints}</p>
                                <p className="text-sm text-slate-500">Total Points</p>
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${grade.color}`}>{percentage}%</p>
                                <p className="text-sm text-slate-500">Score</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Progress
                                value={percentage}
                                className="h-3"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                {answers.filter((a) => a.isCorrect).length} correct
                            </span>
                            <span className="flex items-center gap-1 text-rose-500">
                                <XCircle className="h-4 w-4" />
                                {answers.filter((a) => !a.isCorrect).length} incorrect
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Answer Breakdown */}
                {showFeedback && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900">Answer Breakdown</h2>
                        {questions.map((q, i) => {
                            const studentAnswer = answers.find((a) => a.questionId === q.id);
                            const isCorrect = studentAnswer?.isCorrect ?? false;
                            const studentValue = studentAnswer?.answer || '(no answer)';

                            // For MC, find the text of the student's chosen option and the correct option
                            let displayAnswer = studentValue;
                            let correctDisplay = q.correctAnswer;
                            if (q.type === 'multiple-choice' && q.options) {
                                const chosen = q.options.find((o) => o.id === studentValue);
                                displayAnswer = chosen?.text || studentValue;
                                const correct = q.options.find((o) => o.id === q.correctAnswer);
                                correctDisplay = correct?.text || q.correctAnswer;
                            }

                            return (
                                <Card
                                    key={q.id}
                                    className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-400'
                                        } shadow-sm`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-rose-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-slate-900">
                                                        {i + 1}. {q.text}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            isCorrect
                                                                ? 'bg-emerald-100 text-emerald-700 shrink-0'
                                                                : 'bg-rose-100 text-rose-700 shrink-0'
                                                        }
                                                    >
                                                        {isCorrect ? `+${q.points}` : '0'}/{q.points}
                                                    </Badge>
                                                </div>

                                                <div className="mt-3 space-y-1 text-sm">
                                                    <p className={isCorrect ? 'text-emerald-700' : 'text-rose-600'}>
                                                        <span className="font-medium">Your answer:</span> {displayAnswer}
                                                    </p>
                                                    {!isCorrect && (
                                                        <p className="text-emerald-600">
                                                            <span className="font-medium">Correct answer:</span> {correctDisplay}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    {allowRetry && (
                        <Button onClick={onRetry} className="flex-1 gap-2 bg-sky-500 hover:bg-sky-600">
                            <RotateCcw className="h-4 w-4" /> Try Again
                        </Button>
                    )}
                    <Button onClick={onHome} variant="outline" className="flex-1 gap-2">
                        <Home className="h-4 w-4" /> Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
