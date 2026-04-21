'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Zap,
    CheckCircle2,
    XCircle,
    ArrowRight,
    BarChart3,
    Users,
    Clock,
    PlayCircle,
    Check
} from 'lucide-react';
import { HeroBackgroundWebGL } from './hero-background-webgl';

interface LandingPageProps {
    onStudentStart: () => void;
    onAdminLogin: () => void;
    onPricing?: () => void;
}

export function LandingPage({ onStudentStart, onAdminLogin, onPricing }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200">
            {/* ── Navbar ────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white">
                            <Zap className="h-4 w-4" />
                        </div>
                        <span>QuizFlow</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                        <a href="#product" className="hover:text-slate-900 transition-colors">Product</a>
                        <button onClick={onPricing} className="appearance-none p-0 bg-transparent border-0 hover:text-slate-900 transition-colors">Pricing</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onAdminLogin} className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 font-medium">
                            Login
                        </Button>
                        <Button onClick={onAdminLogin} className="bg-slate-900 text-white hover:bg-slate-800 font-medium rounded-md">
                            Start for free
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative w-full overflow-hidden">
                {/* <HeroBackground /> */}
                {/* <HeroBackgroundPhysics /> */}
                <HeroBackgroundWebGL />
                <div className="px-6 pt-24 pb-20 lg:pt-32 lg:pb-28 max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
                    <Badge variant="secondary" className="mb-8 rounded-full px-4 py-1.5 text-sm font-medium text-slate-800 bg-slate-100/80 border-slate-200">
                        QuizFlow 2.0 is here <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </Badge>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tighter text-slate-900 mb-6 max-w-4xl text-balance leading-tight">
                        The easiest way to take your next exam.
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 text-balance leading-relaxed bg-white/50 px-2 rounded-xl backdrop-blur-sm">
                        Enter your access code, take your test, and get instant results. No clunky sign-ups or distractions.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Button
                            onClick={onStudentStart}
                            size="lg"
                            className="w-full sm:w-auto h-12 px-8 text-base bg-slate-900 text-white hover:bg-slate-800 rounded-md shadow-sm"
                        >
                            Start Test
                        </Button>
                        <Button
                            onClick={onPricing}
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto h-12 px-8 text-base border-slate-200 text-slate-900 hover:bg-white rounded-md gap-2 shadow-sm"
                        >
                            Educator tools
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Social Proof ──────────────────────────────────── */}
            <section className="border-y border-slate-100 bg-slate-50/50 py-10">
                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                    <p className="text-center text-sm font-medium text-slate-400 mb-6 uppercase tracking-widest">
                        Trusted by innovative educators
                    </p>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-60 grayscale">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                            <Users className="h-6 w-6" /> EduCorp
                        </div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                            <BarChart3 className="h-6 w-6" /> LearnMetrics
                        </div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                            <Zap className="h-6 w-6" /> FastAssess
                        </div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-700">
                            <CheckCircle2 className="h-6 w-6" /> CertifyNow
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Product Preview ───────────────────────────────── */}
            <section id="product" className="py-24 px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-[0_0_40px_-10px_rgba(0,0,0,0.08)]">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
                        <div className="flex items-center border-b border-slate-200 bg-white px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-slate-200" />
                                <div className="h-3 w-3 rounded-full bg-slate-200" />
                                <div className="h-3 w-3 rounded-full bg-slate-200" />
                            </div>
                            <div className="mx-auto text-xs font-medium text-slate-400">Dashboard — QuizFlow</div>
                        </div>
                        <div className="p-6 md:p-10 grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-heading font-bold text-slate-900">Advanced React Patterns Quiz</h3>
                                    <p className="text-sm text-slate-500">Active • 142 responses</p>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">Q{i}</div>
                                                <div className="h-3 w-40 rounded-full bg-slate-100" />
                                            </div>
                                            <div className="h-4 w-12 rounded-full bg-slate-100" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Card className="border-slate-200 shadow-none">
                                    <CardContent className="p-6 text-center">
                                        <div className="text-3xl font-bold text-slate-900 mb-1">84%</div>
                                        <div className="text-sm font-medium text-slate-500">Average Score</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-none">
                                    <CardContent className="p-6 text-center">
                                        <div className="text-3xl font-bold text-slate-900 mb-1">02:14</div>
                                        <div className="text-sm font-medium text-slate-500">Avg. Completion Time</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────── */}
            <section className="py-24 bg-slate-50 px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4 tracking-tight">Everything you need, nothing you don't.</h2>
                        <p className="text-lg text-slate-500">Built to get out of your way and let you focus on teaching, not software configuration.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard 
                            icon={<Clock className="h-5 w-5" />}
                            title="Draft in minutes"
                            description="Intuitive keyboard-first builder lets you create entire assessments without touching your mouse."
                        />
                        <FeatureCard 
                            icon={<Zap className="h-5 w-5" />}
                            title="Instant grading"
                            description="Responses are graded the moment they are submitted, giving students immediate feedback loops."
                        />
                        <FeatureCard 
                            icon={<BarChart3 className="h-5 w-5" />}
                            title="Actionable insights"
                            description="Identify knowledge gaps across your entire cohort instantly with intelligent performance analytics."
                        />
                        <FeatureCard 
                            icon={<Users className="h-5 w-5" />}
                            title="Frictionless access"
                            description="Students join via link or code. No passwords to forget, no accounts to provision."
                        />
                        <FeatureCard 
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            title="Flexible formats"
                            description="Support for multiple choice, short text, and code snippets out of the box."
                        />
                        <FeatureCard 
                            icon={<Check className="h-5 w-5" />}
                            title="Export anywhere"
                            description="Push grades directly to your LMS or export as formatted CSVs in one click."
                        />
                    </div>
                </div>
            </section>

            {/* ── Comparison Section ────────────────────────────── */}
            <section className="py-24 px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4 tracking-tight">Why QuizFlow?</h2>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40%] text-slate-900 font-semibold h-14">Feature</TableHead>
                                <TableHead className="text-slate-900 font-semibold h-14">Traditional LMS</TableHead>
                                <TableHead className="text-slate-900 font-semibold h-14">QuizFlow</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <ComparisonRow feature="Setup time" legacy="Days" modern="Minutes" />
                            <ComparisonRow feature="Student onboarding" legacy="Account required" modern="Frictionless link" />
                            <ComparisonRow feature="UI / UX" legacy="Clunky & Dated" modern="Modern & Minimal" />
                            <ComparisonRow feature="Analytics" legacy="Manual export" modern="Real-time dashboard" />
                            <ComparisonRow feature="Cost" legacy="Expensive enterprise" modern="Free to start" />
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────── */}
            <section className="py-24 bg-slate-900 text-white px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
                        <div>
                            <div className="text-slate-500 font-mono text-sm mb-4">01</div>
                            <h3 className="text-xl font-heading font-semibold mb-3">Build</h3>
                            <p className="text-slate-400 leading-relaxed">Type out questions, define correct answers, and configure settings in our minimal editor.</p>
                        </div>
                        <div>
                            <div className="text-slate-500 font-mono text-sm mb-4">02</div>
                            <h3 className="text-xl font-heading font-semibold mb-3">Distribute</h3>
                            <p className="text-slate-400 leading-relaxed">Share a simple access code. Students jump directly into the assessment without signing up.</p>
                        </div>
                        <div>
                            <div className="text-slate-500 font-mono text-sm mb-4">03</div>
                            <h3 className="text-xl font-heading font-semibold mb-3">Analyze</h3>
                            <p className="text-slate-400 leading-relaxed">Watch results stream in real-time. Identify trends and export grades effortlessly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ─────────────────────────────────────── */}
            <section className="py-24 px-6 lg:px-8 max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-6 tracking-tight">Stop wasting time grading.</h2>
                <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">Join thousands of educators saving hours every week with QuizFlow's automated platform.</p>
                <Button
                    onClick={onAdminLogin}
                    size="lg"
                    className="h-14 px-10 text-lg bg-slate-900 text-white hover:bg-slate-800 rounded-md shadow-md"
                >
                    Create your first quiz — free
                </Button>
            </section>

            {/* ── Footer ────────────────────────────────────────── */}
            <footer className="border-t border-slate-200 bg-white py-12 px-6 lg:px-8">
                <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Zap className="h-4 w-4" />
                        QuizFlow
                    </div>
                    <p className="text-sm text-slate-500">© 2026 QuizFlow Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white group">
            <CardContent className="p-8">
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors text-slate-700">
                    {icon}
                </div>
                <h3 className="mb-2 text-lg font-heading font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}

function ComparisonRow({ feature, legacy, modern }: { feature: string; legacy: string; modern: string }) {
    return (
        <TableRow className="hover:bg-slate-50/50">
            <TableCell className="font-medium text-slate-900 py-4">{feature}</TableCell>
            <TableCell className="text-slate-500 py-4 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-slate-300" /> {legacy}
            </TableCell>
            <TableCell className="text-slate-900 font-medium py-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-900" /> {modern}
                </div>
            </TableCell>
        </TableRow>
    );
}
