'use client';

import React, { useState, useEffect } from 'react';
import {
  getSubjects,
  createSubject,
  deleteSubject,
  getQuizzesBySubject,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllResults,
  deleteResult,
  deleteResultsByIds,
  logoutAdmin,
  generateAccessCode,
} from '@/lib/firebase-helpers';
import type { Subject, Quiz, QuizResult, Question } from '@/lib/types';
import { QuestionBuilder } from '@/components/question-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  FileText,
  Eye,
  Download,
  RefreshCw,
  ClipboardCopy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ModeToggle } from './mode-toggle';

interface AdminDashboardProps {
  onLogout: () => void;
}

type View = 'dashboard' | 'subject-detail' | 'create-quiz' | 'edit-quiz' | 'results';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<View>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectQuizzes, setSubjectQuizzes] = useState<Quiz[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ─── New Subject Dialog State ──────────────────────────────
  const [newSubjectOpen, setNewSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectData, resultData] = await Promise.all([getSubjects(), getAllResults()]);
      setSubjects(subjectData);
      setResults(resultData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    setCreating(true);
    try {
      await createSubject({
        name: newSubjectName.trim(),
        description: newSubjectDesc.trim(),
        color: 'sky',
        icon: 'BookOpen',
      });
      setNewSubjectName('');
      setNewSubjectDesc('');
      setNewSubjectOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error creating subject:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject and all its quizzes? This cannot be undone.')) return;
    try {
      await deleteSubject(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  const openSubjectDetail = async (subject: Subject) => {
    setSelectedSubject(subject);
    setView('subject-detail');
    try {
      const quizzes = await getQuizzesBySubject(subject.id);
      setSubjectQuizzes(quizzes);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    try {
      await deleteResult(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting result:', err);
    }
  };

  const exportResults = () => {
    const csv = [
      ['Student', 'Quiz', 'Score', 'Total', 'Percentage', 'Date'],
      ...results.map((r) => [
        r.studentName,
        r.quizTitle,
        r.score,
        r.totalPoints,
        r.percentage + '%',
        new Date(r.submittedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Create / Edit Quiz View ───────────────────────────────
  if (view === 'create-quiz' || view === 'edit-quiz') {
    return (
      <QuizEditor
        subjectId={selectedSubject?.id || ''}
        quiz={editingQuiz}
        onBack={async () => {
          setEditingQuiz(null);
          if (selectedSubject) await openSubjectDetail(selectedSubject);
          else { setView('dashboard'); await loadData(); }
        }}
      />
    );
  }

  // ─── Subject Detail View ───────────────────────────────────
  if (view === 'subject-detail' && selectedSubject) {
    return (
      <DashboardShell onLogout={handleLogout} onBack={() => { setView('dashboard'); setSelectedSubject(null); }}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground">{selectedSubject.name}</h2>
              <p className="mt-2 text-lg text-muted-foreground">{selectedSubject.description}</p>
            </div>
            <Button
              onClick={() => { setEditingQuiz(null); setView('create-quiz'); }}
              className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> New Quiz
            </Button>
          </div>

          {subjectQuizzes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-16 text-center shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">No quizzes yet</h3>
              <p className="mt-1 text-muted-foreground">Create your first quiz for this subject.</p>
              <Button
                onClick={() => { setEditingQuiz(null); setView('create-quiz'); }}
                className="mt-6 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Create Quiz
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjectQuizzes.map((quiz) => (
                <Card key={quiz.id} className="group relative overflow-hidden border border-border bg-background shadow-sm transition-all hover:border-border hover:shadow-md">
                  {quiz.published && (
                    <div className="absolute right-3 top-3">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800">
                        Published
                      </Badge>
                    </div>
                  )}
                  {!quiz.published && (
                    <div className="absolute right-3 top-3">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">Draft</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-lg tracking-tight text-foreground">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                      <span>{quiz.questions.length} <span className="font-normal text-muted-foreground">questions</span></span>
                      <span>{quiz.questions.reduce((s, q) => s + q.points, 0)} <span className="font-normal text-muted-foreground">points</span></span>
                    </div>

                    {quiz.published && (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">Code</span>
                        <code className="text-sm font-bold tracking-widest text-foreground">{quiz.accessCode}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                          onClick={() => handleCopyCode(quiz.accessCode)}
                        >
                          {copiedCode === quiz.accessCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setView('edit-quiz');
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        onClick={async () => {
                          if (!confirm('Delete this quiz?')) return;
                          await deleteQuiz(quiz.id, quiz.subjectId);
                          await openSubjectDetail(selectedSubject);
                          await loadData();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  // ─── Results View ──────────────────────────────────────────
  if (view === 'results') {
    return (
      <ResultsView
        results={results}
        subjects={subjects}
        onLogout={handleLogout}
        onBack={() => setView('dashboard')}
        onDeleteResult={handleDeleteResult}
        onDeleteResults={async (ids: string[]) => {
          if (!confirm(`Delete ${ids.length} submission${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
          try {
            await deleteResultsByIds(ids);
            setResults((prev) => prev.filter((r) => !ids.includes(r.id)));
          } catch (err) {
            console.error('Error deleting results:', err);
          }
        }}
        onClearAll={async () => {
          if (!confirm('Delete ALL submissions? This cannot be undone.')) return;
          try {
            await deleteResultsByIds(results.map((r) => r.id));
            setResults([]);
          } catch (err) {
            console.error('Error clearing results:', err);
          }
        }}
        exportResults={exportResults}
      />
    );
  }

  // ─── Main Dashboard View ───────────────────────────────────
  const gradedCount = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;
  const uniqueStudents = new Set(results.map((r) => r.studentName)).size;

  return (
    <DashboardShell onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Subjects" value={subjects.length} color="sky" />
          <StatCard icon={<FileText className="h-5 w-5" />} label="Total Quizzes" value={subjects.reduce((s, sub) => s + sub.quizCount, 0)} color="teal" />
          <StatCard icon={<Users className="h-5 w-5" />} label="Unique Students" value={uniqueStudents} color="violet" />
          <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Avg Score" value={`${avgScore}%`} color="amber" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={newSubjectOpen} onOpenChange={setNewSubjectOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Plus className="h-4 w-4" /> New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Create New Subject</DialogTitle>
                <DialogDescription>Add a subject to organize your quizzes (e.g. &quot;Mathematics 101&quot;).</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">Subject Name</Label>
                  <Input
                    placeholder="e.g. Mathematics 101"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="border-border focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-foreground">Description</Label>
                  <Textarea
                    placeholder="Brief description of this subject..."
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    className="resize-none border-border focus-visible:ring-ring"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewSubjectOpen(false)} className="border-border">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubject}
                  disabled={creating || !newSubjectName.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" /> : null}
                  Create Subject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadData} className="gap-2 border-border text-foreground hover:bg-accent">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">Your Subjects</h2>
          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-16 text-center shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">No subjects yet</h3>
              <p className="mt-1 text-muted-foreground">Create your first subject to start building quizzes.</p>
              <Button
                onClick={() => setNewSubjectOpen(true)}
                className="mt-6 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Create Subject
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="group cursor-pointer border border-border bg-background shadow-sm transition-all hover:border-border hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => openSubjectDetail(subject)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-ring">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="font-heading text-xl tracking-tight text-foreground">{subject.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 text-sm text-muted-foreground">{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{subject.quizCount} {subject.quizCount === 1 ? 'quiz' : 'quizzes'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* All Submissions - Grouped by Subject */}
        {results.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">All Submissions</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportResults} className="gap-1.5 border-border text-foreground hover:bg-accent">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => setView('results')} className="gap-1.5 border-border text-foreground hover:bg-accent">
                  <Eye className="h-3.5 w-3.5" /> Detailed View
                </Button>
              </div>
            </div>
            {(() => {
              const subjectIds = [...new Set(results.map((r) => r.subjectId))];
              const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));
              return (
                <Tabs defaultValue={subjectIds[0] || 'all'} className="w-full">
                  <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-muted/50 p-1">
                    {subjectIds.map((sid) => (
                      <TabsTrigger key={sid} value={sid} className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        {subjectMap[sid] || 'Unknown Subject'}
                        <Badge variant="secondary" className="ml-2 h-5 bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                          {results.filter((r) => r.subjectId === sid).length}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {subjectIds.map((sid) => {
                    const subjectResults = results.filter((r) => r.subjectId === sid);
                    // Group by student + quiz
                    const grouped = new Map<string, QuizResult[]>();
                    for (const r of subjectResults) {
                      const key = `${r.studentName}|||${r.quizTitle}`;
                      if (!grouped.has(key)) grouped.set(key, []);
                      grouped.get(key)!.push(r);
                    }
                    // Sort each group by date ascending (attempt 1 first)
                    for (const arr of grouped.values()) {
                      arr.sort((a, b) => a.submittedAt - b.submittedAt);
                    }
                    let idx = 0;
                    return (
                      <TabsContent key={sid} value={sid} className="mt-0">
                        <Card className="border border-border bg-background shadow-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Best</TableHead>
                                    <TableHead>Latest</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...grouped.entries()].map(([key, attempts]) => {
                                    idx++;
                                    const best = attempts.reduce((a, b) => a.percentage > b.percentage ? a : b);
                                    const latest = attempts[attempts.length - 1];
                                    return (
                                      <TableRow key={key}>
                                        <TableCell className="text-xs text-muted-foreground">{idx}</TableCell>
                                        <TableCell className="font-medium">{attempts[0].studentName}</TableCell>
                                        <TableCell>{attempts[0].quizTitle}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1.5">
                                            {attempts.map((a, i) => (
                                              <Badge
                                                key={a.id}
                                                variant="secondary"
                                                className={`text-xs ${
                                                  a.percentage >= 80
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                    : a.percentage >= 60
                                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                }`}
                                                title={`Attempt ${i + 1}: ${a.score}/${a.totalPoints} on ${new Date(a.submittedAt).toLocaleDateString()}`}
                                              >
                                                #{i + 1}: {a.percentage}%
                                              </Badge>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40">
                                            {best.percentage}%
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {new Date(latest.submittedAt).toLocaleDateString()}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              );
            })()}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// ─── Dashboard Shell (Shared layout) ─────────────────────────
function DashboardShell({ children, onLogout, onBack }: { children: React.ReactNode; onLogout: () => void; onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-lg font-heading font-bold tracking-tight text-foreground">QuizFlow</span>
            <Badge variant="secondary" className="ml-2 bg-muted text-foreground font-medium">
              Admin
            </Badge>
          </div>
          <div>
            <ModeToggle />
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
          </div>
          
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
const statColors: Record<string, string> = {
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
};

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="border border-border bg-background shadow-sm transition-shadow hover:shadow-md rounded-xl">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-3xl font-heading font-bold tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Results View (Full-featured) ────────────────────────────
type SortField = 'student' | 'quiz' | 'best' | 'attempts' | 'date';
type SortDir = 'asc' | 'desc';

interface StudentQuizGroup {
  key: string;
  studentName: string;
  quizTitle: string;
  attempts: QuizResult[];
  best: number;
  latest: number;
}

function ResultsView({
  results,
  subjects,
  onLogout,
  onBack,
  onDeleteResult,
  onDeleteResults,
  onClearAll,
  exportResults,
}: {
  results: QuizResult[];
  subjects: Subject[];
  onLogout: () => void;
  onBack: () => void;
  onDeleteResult: (id: string) => void;
  onDeleteResults: (ids: string[]) => void;
  onClearAll: () => void;
  exportResults: () => void;
}) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const subjectIds = [...new Set(results.map((r) => r.subjectId))];
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'date' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />;
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3 text-foreground" />
      : <ArrowDown className="ml-1 inline h-3 w-3 text-foreground" />;
  };

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const buildGroups = (subjectResults: QuizResult[]): StudentQuizGroup[] => {
    const map = new Map<string, QuizResult[]>();
    for (const r of subjectResults) {
      const key = `${r.studentName}|||${r.quizTitle}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    // Sort attempts within each group by date ascending
    for (const arr of map.values()) {
      arr.sort((a, b) => a.submittedAt - b.submittedAt);
    }
    const groups: StudentQuizGroup[] = [...map.entries()].map(([key, attempts]) => ({
      key,
      studentName: attempts[0].studentName,
      quizTitle: attempts[0].quizTitle,
      attempts,
      best: Math.max(...attempts.map((a) => a.percentage)),
      latest: attempts[attempts.length - 1].submittedAt,
    }));

    // Filter by search
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? groups.filter(
          (g) =>
            g.studentName.toLowerCase().includes(q) ||
            g.quizTitle.toLowerCase().includes(q)
        )
      : groups;

    // Sort groups
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'student':
          cmp = a.studentName.localeCompare(b.studentName);
          break;
        case 'quiz':
          cmp = a.quizTitle.localeCompare(b.quizTitle);
          break;
        case 'best':
          cmp = a.best - b.best;
          break;
        case 'attempts':
          cmp = a.attempts.length - b.attempts.length;
          break;
        case 'date':
          cmp = a.latest - b.latest;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  };

  return (
    <DashboardShell onLogout={onLogout} onBack={onBack}>
      <div className="space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">All Results</h2>
            <p className="mt-1 text-muted-foreground">{results.length} total submissions from {new Set(results.map(r => r.studentName)).size} students</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportResults} variant="outline" size="sm" className="gap-1.5 border-border shadow-sm hover:bg-accent">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
              onClick={onClearAll}
              disabled={results.length === 0}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear All
            </Button>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search by student name or quiz title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md border-border shadow-sm focus-visible:ring-ring"
        />

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-16 text-center shadow-sm">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-lg font-bold text-foreground">No submissions yet</h3>
            <p className="mt-1 text-muted-foreground">Results will appear here once students take quizzes.</p>
          </div>
        ) : (
          <Tabs defaultValue={subjectIds[0] || 'all'} className="w-full">
            <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-muted/50 p-1">
              {subjectIds.map((sid) => (
                <TabsTrigger key={sid} value={sid} className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  {subjectMap[sid] || 'Unknown Subject'}
                  <Badge variant="secondary" className="ml-2 h-5 bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    {results.filter((r) => r.subjectId === sid).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {subjectIds.map((sid) => {
              const subjectResults = results.filter((r) => r.subjectId === sid);
              const groups = buildGroups(subjectResults);
              return (
                <TabsContent key={sid} value={sid} className="mt-0">
                  {/* Tab actions */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      <span className="text-foreground">{groups.length}</span> student-quiz group{groups.length !== 1 ? 's' : ''} &middot; <span className="text-foreground">{subjectResults.length}</span> attempt{subjectResults.length !== 1 ? 's' : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      onClick={() => onDeleteResults(subjectResults.map((r) => r.id))}
                      disabled={subjectResults.length === 0}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear Subject
                    </Button>
                  </div>

                  <Card className="border border-border bg-background shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">#</TableHead>
                              <TableHead className="w-8"></TableHead>
                              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('student')}>
                                Student <SortIcon field="student" />
                              </TableHead>
                              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('quiz')}>
                                Quiz <SortIcon field="quiz" />
                              </TableHead>
                              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('attempts')}>
                                Attempts <SortIcon field="attempts" />
                              </TableHead>
                              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('best')}>
                                Best Score <SortIcon field="best" />
                              </TableHead>
                              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                                Latest <SortIcon field="date" />
                              </TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groups.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                  No matching results
                                </TableCell>
                              </TableRow>
                            )}
                            {groups.map((g, gIdx) => (
                              <React.Fragment key={g.key}>
                                {/* Main row */}
                                <TableRow
                                  className={`cursor-pointer hover:bg-accent ${expandedRows.has(g.key) ? 'bg-muted' : ''}`}
                                  onClick={() => g.attempts.length > 1 && toggleExpand(g.key)}
                                >
                                  <TableCell className="text-xs text-muted-foreground">{gIdx + 1}</TableCell>
                                  <TableCell className="px-1">
                                    {g.attempts.length > 1 ? (
                                      expandedRows.has(g.key)
                                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    ) : null}
                                  </TableCell>
                                  <TableCell className="font-medium">{g.studentName}</TableCell>
                                  <TableCell>{g.quizTitle}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="text-xs">
                                      {g.attempts.length} attempt{g.attempts.length > 1 ? 's' : ''}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className={
                                        g.best >= 80
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                          : g.best >= 60
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                      }
                                    >
                                      {g.best}%
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(g.latest).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteResults(g.attempts.map((a) => a.id));
                                      }}
                                      title="Reset all attempts for this student"
                                    >
                                      <RotateCcw className="h-3 w-3" /> Reset
                                    </Button>
                                  </TableCell>
                                </TableRow>

                                {/* Expanded attempt rows */}
                                {expandedRows.has(g.key) && g.attempts.map((a, aIdx) => (
                                  <TableRow key={a.id} className="bg-muted/60">
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="pl-8 text-sm text-muted-foreground">
                                      <Badge variant="outline" className="text-xs font-normal">
                                        Attempt {aIdx + 1}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {a.score}/{a.totalPoints} pts
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          a.percentage >= 80
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                            : a.percentage >= 60
                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                        }`}
                                      >
                                        {a.percentage}%
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                      {new Date(a.submittedAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                        onClick={() => onDeleteResult(a.id)}
                                        title="Delete this attempt"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </DashboardShell>
  );
}

// ─── Quiz Editor (Create / Edit) ─────────────────────────────
function QuizEditor({
  subjectId,
  quiz,
  onBack,
}: {
  subjectId: string;
  quiz: Quiz | null;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [published, setPublished] = useState(quiz?.published || false);
  const [allowRetry, setAllowRetry] = useState(quiz?.allowRetry ?? true);
  const [showFeedback, setShowFeedback] = useState(quiz?.showFeedback ?? true);
  const [accessCode] = useState(quiz?.accessCode || generateAccessCode());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (!title.trim()) return 'Please enter a quiz title.';
    if (questions.length === 0) return 'Add at least one question.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} is missing text.`;
      if (!q.correctAnswer.trim()) return `Question ${i + 1} needs a correct answer.`;
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length < 2) return `Question ${i + 1} needs at least 2 options.`;
        const emptyOpts = q.options.filter((o) => !o.text.trim());
        if (emptyOpts.length > 0) return `Question ${i + 1} has empty option(s).`;
        const correctOpt = q.options.find((o) => o.id === q.correctAnswer);
        if (!correctOpt) return `Question ${i + 1}: please select a correct answer.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSaving(true);

    try {
      if (quiz) {
        await updateQuiz(quiz.id, {
          title: title.trim(),
          description: description.trim(),
          questions,
          published,
          allowRetry,
          showFeedback,
          accessCode,
        });
      } else {
        await createQuiz({
          subjectId,
          title: title.trim(),
          description: description.trim(),
          questions,
          published,
          allowRetry,
          showFeedback,
          accessCode,
        });
      }
      onBack();
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            {quiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="mt-1 text-muted-foreground">Build your quiz questions below.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
              <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Quiz Info */}
          <Card className="border border-border bg-background shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-xl tracking-tight">Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Title</Label>
                <Input
                  placeholder="e.g. Chapter 3 Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-border focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Description</Label>
                <Textarea
                  placeholder="Brief description of this quiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none border-border focus-visible:ring-ring"
                />
              </div>

              {/* Access Code */}
              <div className="rounded-xl border border-border bg-muted p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">Access Code</p>
                    <p className="font-heading text-3xl font-bold tracking-widest text-foreground">{accessCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border shadow-sm"
                    onClick={() => navigator.clipboard.writeText(accessCode)}
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Share this code with students so they can access the quiz.
                </p>
              </div>

              {/* Settings */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-foreground">Published</Label>
                    <p className="text-sm text-muted-foreground">Students can access this quiz.</p>
                  </div>
                  <Switch checked={published} onCheckedChange={setPublished} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-foreground">Allow Retry</Label>
                    <p className="text-sm text-muted-foreground">Students can retake the quiz.</p>
                  </div>
                  <Switch checked={allowRetry} onCheckedChange={setAllowRetry} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-foreground">Show Feedback</Label>
                    <p className="text-sm text-muted-foreground">Show correct answers after submission.</p>
                  </div>
                  <Switch checked={showFeedback} onCheckedChange={setShowFeedback} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">Questions</h2>
            <QuestionBuilder questions={questions} onChange={setQuestions} />
          </div>

          {/* Bottom Save */}
          <div className="flex gap-3 border-t border-border pt-8">
            <Button variant="outline" onClick={onBack} className="border-border hover:bg-accent text-foreground">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              {quiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
