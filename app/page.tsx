'use client';

import { useState, useEffect } from 'react';
import { onAuthChange } from '@/lib/firebase-helpers';
import { LandingPage } from '@/components/landing-page';
import { AuthScreen } from '@/components/auth/auth-screen';
import { PricingPage } from '@/components/pricing/pricing-page';
import { AdminDashboard } from '@/components/admin-dashboard';
import { TestTaker } from '@/components/test-taker';
import type { User } from 'firebase/auth';

type AppView = 'landing' | 'pricing' | 'auth' | 'student' | 'admin-dashboard';

export default function Home() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [studentData, setStudentData] = useState<{name: string, accessCode: string} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setAuthChecked(true);
      // If already authenticated and on login, go to dashboard
      if (u && view === 'auth') {
        setView('admin-dashboard');
      }
    });
    return () => unsubscribe();
  }, [view]);

  // ─── Student quiz flow ─────────────────────────────────────
  if (view === 'student') {
    return <TestTaker 
             onBack={() => setView('landing')} 
             initialName={studentData?.name} 
             initialCode={studentData?.accessCode} 
           />;
  }

  // ─── Pricing page ──────────────────────────────────────────
  if (view === 'pricing') {
    return <PricingPage onBack={() => setView('landing')} onStart={() => setView('auth')} />;
  }

  // ─── Auth flow (replaces admin-login) ──────────────────────
  if (view === 'auth') {
    return (
      <AuthScreen
        onBack={() => setView('landing')}
        onStudentStart={(name, accessCode) => {
            setStudentData({ name, accessCode });
            setView('student');
        }}
        onLoginSuccess={() => setView('admin-dashboard')}
      />
    );
  }

  // ─── Admin dashboard (auth-protected) ──────────────────────
  if (view === 'admin-dashboard') {
    if (!authChecked) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      );
    }
    if (!user) {
      return (
        <AuthScreen
          onBack={() => setView('landing')}
          onStudentStart={(name, accessCode) => {
              setStudentData({ name, accessCode });
              setView('student');
          }}
          onLoginSuccess={() => setView('admin-dashboard')}
          initialMode="login"
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={() => {
          setUser(null);
          setView('landing');
        }}
      />
    );
  }

  // ─── Landing page (default) ────────────────────────────────
  return (
    <LandingPage
      onStudentStart={() => setView('auth')}
      onAdminLogin={() => {
        if (user) setView('admin-dashboard');
        else setView('auth');
      }}
      onPricing={() => setView('pricing')}
    />
  );
}