'use client';

import { useState } from 'react';
import { AuthEntry } from './auth-entry';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

export type AuthMode = 'entry' | 'login' | 'signup';

interface AuthScreenProps {
    onBack: () => void;
    // We pass name and accessCode to parent since the original TestTaker wants them, 
    // or we just call onStudentStart empty and let it show its own screen. 
    // Based on user request, the entry screen acts as the actual Student entry,
    // so we probably want to pass them up so TestTaker can consume them or bypass 'join' step.
    onStudentStart: (name: string, accessCode: string) => void;
    onLoginSuccess: () => void;
    initialMode?: AuthMode;
}

export function AuthScreen({ onBack, onStudentStart, onLoginSuccess, initialMode = 'entry' }: AuthScreenProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-muted">
            <div className="w-full max-w-2xl mx-auto">
                {mode === 'entry' && (
                    <AuthEntry 
                        onBack={onBack}
                        onStudentStart={onStudentStart}
                        onEducatorStart={() => setMode('login')}
                    />
                )}
                {mode === 'login' && (
                    <LoginForm 
                        onBack={() => setMode('entry')}
                        onNavigateSignup={() => setMode('signup')}
                        onLoginSuccess={onLoginSuccess}
                    />
                )}
                {mode === 'signup' && (
                    <SignupForm 
                        onBack={() => setMode('login')}
                        onNavigateLogin={() => setMode('login')}
                    />
                )}
            </div>
        </div>
    );
}