'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BookOpen, Shield, Loader2 } from 'lucide-react';

interface AuthEntryProps {
    onBack: () => void;
    onStudentStart: (name: string, accessCode: string) => void;
    onEducatorStart: () => void;
}

export function AuthEntry({ onBack, onStudentStart, onEducatorStart }: AuthEntryProps) {
    const [name, setName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !accessCode.trim()) return;
        setLoading(true);
        // Add a slight delay for better polished UX feel before transitions
        setTimeout(() => {
            onStudentStart(name, accessCode);
        }, 400);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center space-y-2">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to QuizFlow</h1>
                <p className="text-sm text-muted-foreground">Choose how you want to continue</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Student Entry */}
                <Card className="border-border shadow-sm hover:border-border transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-foreground">Take a Quiz</h2>
                        </div>
                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="student-name">Name</Label>
                                <Input 
                                    id="student-name" 
                                    className="h-10 border-border focus-visible:ring-ring" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="access-code">Access Code</Label>
                                <Input 
                                    id="access-code" 
                                    className="h-10 border-border focus-visible:ring-ring uppercase" 
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                                disabled={!name.trim() || !accessCode.trim() || loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Quiz'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Educator Entry */}
                <Card className="border-border shadow-sm hover:border-border transition-colors">
                    <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-foreground">Educator Login</h2>
                        </div>
                        <div className="flex-1 text-sm text-muted-foreground mb-6 leading-relaxed">
                            Sign in to your educator dashboard to create quizzes, view analytical reports, and manage your students.
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full h-10 border-border text-foreground hover:bg-accent mt-auto"
                            onClick={onEducatorStart}
                        >
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}