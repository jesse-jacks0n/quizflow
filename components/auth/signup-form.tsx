'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface SignupFormProps {
    onBack: () => void;
    onNavigateLogin: () => void;
}

export function SignupForm({ onBack, onNavigateLogin }: SignupFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !email.trim() || !password.trim()) return;

        setLoading(true);
        
        // Stub implementation as requested
        setTimeout(() => {
            setLoading(false);
            alert("Signup successful! (Stubbed) - Redirecting to login...");
            onNavigateLogin();
        }, 1500);
    };

    return (
        <div className="max-w-[400px] w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center space-y-2">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h1>
                <p className="text-sm text-muted-foreground">Sign up to start building assessments</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                type="text"
                                className="h-10 border-border focus-visible:ring-ring" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email"
                                className="h-10 border-border focus-visible:ring-ring" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password"
                                className="h-10 border-border focus-visible:ring-ring" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
                            disabled={!name.trim() || !email.trim() || !password.trim() || loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                        </Button>

                        <div className="pt-4 text-center">
                            <Button 
                                variant="ghost" 
                                className="text-sm text-muted-foreground hover:text-foreground" 
                                onClick={onNavigateLogin}
                                type="button"
                            >
                                Already have an account? Sign in
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}