'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface PricingPageProps {
    onBack: () => void;
    onStart: () => void;
}

export function PricingPage({ onBack, onStart }: PricingPageProps) {
    return (
        <div className="min-h-screen bg-muted text-foreground font-sans selection:bg-muted py-12 px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-16">
                
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground -ml-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </div>

                {/* Header */}
                <div className="text-center space-y-4 pt-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Start free. Upgrade when you need more control. No hidden fees.
                    </p>
                </div>

                {/* Pricing Tiers */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Tier 1 - Free */}
                    <Card className="border-border shadow-sm hover:scale-[1.02] transition-transform duration-200 bg-background">
                        <CardHeader className="pb-8">
                            <CardTitle className="text-xl font-semibold mb-2">Free</CardTitle>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold">$0</span>
                                <span className="text-muted-foreground font-medium">/forever</span>
                            </div>
                            <CardDescription className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                Perfect for casual educators and small-scale testing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-4 text-sm font-medium text-foreground mb-8">
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Create up to 3 quizzes</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Up to 50 student submissions</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Basic analytics</li>
                            </ul>
                            <Button onClick={onStart} variant="outline" className="w-full text-foreground border-border h-11 hover:bg-accent font-medium shadow-sm">
                                Start for free
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tier 2 - Pro (Most Important) */}
                    <Card className="border-border shadow-xl shadow-sm hover:scale-[1.02] transition-transform duration-200 relative overflow-hidden ring-1 ring-ring bg-background md:scale-105 z-10">
                        <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                        <CardHeader className="pb-8">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-xl font-semibold">Pro</CardTitle>
                                <span className="text-xs font-bold uppercase tracking-wider bg-muted text-foreground px-2.5 py-1 rounded-full">
                                    Most Popular
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold">$9</span>
                                <span className="text-muted-foreground font-medium">/month</span>
                            </div>
                            <CardDescription className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                Advanced features for professional educators and institutions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-4 text-sm font-medium text-foreground mb-8">
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-foreground" /> Unlimited quizzes</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-foreground" /> Unlimited students</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-foreground" /> Real-time analytics dashboard</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-foreground" /> Auto-grading</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-foreground" /> Priority support</li>
                            </ul>
                            <Button onClick={onStart} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-md">
                                Upgrade to Pro
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Tier 3 - Enterprise */}
                    <Card className="border-border shadow-sm hover:scale-[1.02] transition-transform duration-200 bg-background">
                        <CardHeader className="pb-8">
                            <CardTitle className="text-xl font-semibold mb-2">School / Enterprise</CardTitle>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold">Custom</span>
                            </div>
                            <CardDescription className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                For large schools needing multi-admin setups and bespoke features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-4 text-sm font-medium text-foreground mb-8">
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Multi-admin support</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Advanced analytics</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Custom branding</li>
                                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-muted-foreground" /> Dedicated support</li>
                            </ul>
                            <Button variant="outline" className="w-full text-foreground border-border h-11 hover:bg-accent font-medium shadow-sm">
                                Contact Sales
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Comparison Table */}
                <div className="space-y-10 max-w-5xl mx-auto pt-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Compare Plans</h2>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[40%] text-foreground font-semibold h-14">Feature</TableHead>
                                    <TableHead className="text-foreground font-semibold h-14">Free</TableHead>
                                    <TableHead className="text-foreground font-semibold h-14">Pro</TableHead>
                                    <TableHead className="text-foreground font-semibold h-14">Enterprise</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-foreground py-4">Quiz limit</TableCell>
                                    <TableCell className="text-muted-foreground py-4">3 active quizzes</TableCell>
                                    <TableCell className="text-foreground font-medium py-4">Unlimited</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Unlimited</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-foreground py-4">Student limit</TableCell>
                                    <TableCell className="text-muted-foreground py-4">50 submissions</TableCell>
                                    <TableCell className="text-foreground font-medium py-4">Unlimited</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Unlimited</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-foreground py-4">Analytics depth</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Basic scores</TableCell>
                                    <TableCell className="text-foreground font-medium py-4">Real-time dashboards</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Advanced & custom exports</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-foreground py-4">Admin features</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Single admin</TableCell>
                                    <TableCell className="text-foreground font-medium py-4">Single admin</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Multi-admin & roles</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-foreground py-4">Support level</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Community</TableCell>
                                    <TableCell className="text-foreground font-medium py-4">Priority</TableCell>
                                    <TableCell className="text-muted-foreground py-4">Dedicated manager</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-10 max-w-3xl mx-auto pt-16 pb-12">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8">Frequently asked questions</h2>
                    </div>
                    <div className="space-y-8 divide-y divide-border">
                        <div className="pt-8 first:pt-0">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Can I upgrade later?</h3>
                            <p className="text-muted-foreground leading-relaxed">Absolutely. You can start with the Free plan and upgrade to Pro at any time. Your data and created quizzes will seamlessly carry over.</p>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Do students need accounts?</h3>
                            <p className="text-muted-foreground leading-relaxed">No. Students join effortlessly using an access code and their name. We pride ourselves on offering a zero-friction experience for test-takers.</p>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Is there a free trial?</h3>
                            <p className="text-muted-foreground leading-relaxed">The Free tier acts as an indefinite trial. If you need to test Pro features before committing, contact our support team for a 14-day trial pass.</p>
                        </div>
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
                            <p className="text-muted-foreground leading-relaxed">Yes, all our paid plans are strictly month-to-month unless you opt for an annual subscription. You can cancel with a single click in your billing dashboard.</p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="border-t border-border pt-24 text-center pb-12">
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-8">Start creating quizzes in minutes</h2>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button onClick={onStart} className="w-full sm:w-auto h-12 px-10 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                            Start for free
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto h-12 px-10 text-base font-medium border-border text-foreground hover:bg-accent gap-2 shadow-sm">
                            View demo <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}