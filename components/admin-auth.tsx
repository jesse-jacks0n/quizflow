'use client';

import { useState } from 'react';
import { loginAdmin } from '@/lib/firebase-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, ArrowLeft, Loader2, Shield } from 'lucide-react';

interface AdminAuthProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AdminAuth({ onBack, onSuccess }: AdminAuthProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loginAdmin(email, password);
            onSuccess();
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please wait a moment and try again.');
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 p-4">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />

            <div className="relative w-full max-w-md space-y-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="gap-2 text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500 text-white">
                            <Shield className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Educator Login</CardTitle>
                        <CardDescription className="text-base">
                            Sign in to manage subjects and quizzes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="educator@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !email.trim() || !password.trim()}
                                className="h-12 w-full bg-sky-500 text-base font-semibold hover:bg-sky-600"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-center">
                            <p className="text-sm text-slate-500">
                                Don&apos;t have an account? Contact your institution administrator
                                to get your educator credentials.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
