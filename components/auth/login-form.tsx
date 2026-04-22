'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface LoginFormProps {
    onBack: () => void;
    onNavigateSignup: () => void;
    onLoginSuccess: () => void;
}

export function LoginForm({ onBack, onNavigateSignup, onLoginSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Using real imports dynamically if needed, or stubbing them out. Since it's UI only constraints, 
    // the system originally used firebase loginAdmin. We will mock the behavior to show states, 
    // but the actual `loginAdmin` could be imported and used here just like `admin-auth.tsx`. 
    // Wait, the prompt allowed keeping Educator login functional just like the old `admin-auth.tsx`, 
    // and ONLY stubbing signup. So I'll import `loginAdmin`.
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!email.trim() || !password.trim()) return;

        setLoading(true);
        try {
            // we will dynamic import or just rely on parent supplying the success 
            // Better to use the firebase helper directly
            const { loginAdmin } = await import('@/lib/firebase-helpers');
            await loginAdmin(email, password);
            onLoginSuccess();
        } catch (error) {
            console.error('Login failed', error);
            // Handling simple UI fallback for demo purposes since we don't have robust toast context yet
            alert("Invalid credentials. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[400px] w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center space-y-2">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Educator Login</h1>
                <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleLogin} className="space-y-5">
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Button variant="link" className="p-0 h-auto font-normal text-xs text-muted-foreground hover:text-foreground" type="button">
                                    Forgot password?
                                </Button>
                            </div>
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
                            disabled={!email.trim() || !password.trim() || loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                        </Button>
                        
                        <div className="pt-4 text-center">
                            <Button 
                                variant="ghost" 
                                className="text-sm text-muted-foreground hover:text-foreground" 
                                onClick={onNavigateSignup}
                                type="button"
                            >
                                Don&apos;t have an account? Create account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}