'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, GripVertical, Upload, FileJson } from 'lucide-react';
import type { Question, QuestionOption, QuestionType } from '@/lib/types';

interface QuestionBuilderProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
}

function generateId() {
    return 'q_' + Math.random().toString(36).substring(2, 10);
}

function generateOptionId() {
    return 'opt_' + Math.random().toString(36).substring(2, 10);
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError('');
        setUploadSuccess('');
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setUploadError('Please upload a .json file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const raw = JSON.parse(e.target?.result as string);
                const items: unknown[] = Array.isArray(raw) ? raw : raw.questions;
                if (!Array.isArray(items) || items.length === 0) {
                    setUploadError('JSON must contain a "questions" array or be an array of questions.');
                    return;
                }

                const parsed: Question[] = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i] as Record<string, unknown>;
                    const qText = String(item.question || '').trim();
                    if (!qText) {
                        setUploadError(`Question ${i + 1} is missing the "question" field.`);
                        return;
                    }

                    const choices = item.choices as string[] | undefined;
                    const answer = String(item.answer || '').trim();
                    if (!answer) {
                        setUploadError(`Question ${i + 1} is missing the "answer" field.`);
                        return;
                    }

                    const points = typeof item.points === 'number' ? item.points : 10;

                    if (choices && Array.isArray(choices) && choices.length >= 2) {
                        // Multiple choice
                        const options: QuestionOption[] = choices.map((c) => ({
                            id: generateOptionId(),
                            text: String(c).trim(),
                        }));

                        const correctIndex = choices.findIndex(
                            (c) => String(c).trim().toLowerCase() === answer.toLowerCase()
                        );
                        if (correctIndex === -1) {
                            setUploadError(
                                `Question ${i + 1}: answer "${answer}" does not match any choice. The answer must exactly match one of the choices.`
                            );
                            return;
                        }

                        parsed.push({
                            id: generateId(),
                            text: qText,
                            type: 'multiple-choice',
                            options,
                            correctAnswer: options[correctIndex].id,
                            points,
                            order: questions.length + i,
                        });
                    } else {
                        // Text input
                        parsed.push({
                            id: generateId(),
                            text: qText,
                            type: 'text-input',
                            correctAnswer: answer,
                            points,
                            order: questions.length + i,
                        });
                    }
                }

                onChange([...questions, ...parsed]);
                setUploadSuccess(`Successfully imported ${parsed.length} question${parsed.length > 1 ? 's' : ''}!`);
            } catch {
                setUploadError('Invalid JSON file. Please check the format and try again.');
            }
        };
        reader.readAsText(file);

        // Reset so the same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addQuestion = () => {
        const newQ: Question = {
            id: generateId(),
            text: '',
            type: 'multiple-choice',
            options: [
                { id: generateOptionId(), text: '' },
                { id: generateOptionId(), text: '' },
                { id: generateOptionId(), text: '' },
                { id: generateOptionId(), text: '' },
            ],
            correctAnswer: '',
            points: 10,
            order: questions.length,
        };
        onChange([...questions, newQ]);
    };

    const updateQuestion = (index: number, updates: Partial<Question>) => {
        const updated = questions.map((q, i) => (i === index ? { ...q, ...updates } : q));
        onChange(updated);
    };

    const removeQuestion = (index: number) => {
        onChange(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
    };

    const updateOption = (qIndex: number, optIndex: number, text: string) => {
        const q = questions[qIndex];
        if (!q.options) return;
        const newOpts = q.options.map((o, i) => (i === optIndex ? { ...o, text } : o));
        updateQuestion(qIndex, { options: newOpts });
    };

    const addOption = (qIndex: number) => {
        const q = questions[qIndex];
        const newOpts = [...(q.options || []), { id: generateOptionId(), text: '' }];
        updateQuestion(qIndex, { options: newOpts });
    };

    const removeOption = (qIndex: number, optIndex: number) => {
        const q = questions[qIndex];
        if (!q.options || q.options.length <= 2) return;
        const removed = q.options[optIndex];
        const newOpts = q.options.filter((_, i) => i !== optIndex);
        const updates: Partial<Question> = { options: newOpts };
        if (q.correctAnswer === removed.id) updates.correctAnswer = '';
        updateQuestion(qIndex, updates);
    };

    const changeType = (qIndex: number, type: QuestionType) => {
        if (type === 'multiple-choice') {
            updateQuestion(qIndex, {
                type,
                options: [
                    { id: generateOptionId(), text: '' },
                    { id: generateOptionId(), text: '' },
                    { id: generateOptionId(), text: '' },
                    { id: generateOptionId(), text: '' },
                ],
                correctAnswer: '',
            });
        } else {
            updateQuestion(qIndex, {
                type,
                options: undefined,
                correctAnswer: '',
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
            />

            {/* Upload JSON Card */}
            <Card className="border-sky-200 bg-sky-50/50 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                                <FileJson className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-sky-800">Import from JSON</p>
                                <p className="text-xs text-sky-600">
                                    Upload a JSON file to bulk-add questions
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-sky-300 text-sky-700 hover:bg-sky-100"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" /> Upload JSON
                        </Button>
                    </div>
                    {uploadError && (
                        <Alert variant="destructive" className="mt-3 border-red-200 bg-red-50">
                            <AlertDescription className="text-sm text-red-800">{uploadError}</AlertDescription>
                        </Alert>
                    )}
                    {uploadSuccess && (
                        <Alert className="mt-3 border-green-200 bg-green-50">
                            <AlertDescription className="text-sm text-green-800">{uploadSuccess}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {questions.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <p className="mb-2 text-lg font-medium text-slate-400">No questions yet</p>
                    <p className="mb-6 text-sm text-slate-400">Add your first question to get started</p>
                    <Button onClick={addQuestion} className="gap-2 bg-sky-500 hover:bg-sky-600">
                        <Plus className="h-4 w-4" /> Add Question
                    </Button>
                </div>
            )}

            {questions.map((q, qIdx) => (
                <Card key={q.id} className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300" />
                                <CardTitle className="text-base font-semibold text-slate-700">
                                    Question {qIdx + 1}
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={q.type} onValueChange={(v) => changeType(qIdx, v as QuestionType)}>
                                    <SelectTrigger className="h-8 w-[160px] text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="text-input">Text Input</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(qIdx)}
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Question text */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Question Text</Label>
                            <Textarea
                                placeholder="Enter your question..."
                                value={q.text}
                                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                                className="min-h-[80px] resize-none"
                            />
                        </div>

                        {/* Points */}
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium text-slate-600">Points</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={q.points}
                                onChange={(e) => updateQuestion(qIdx, { points: parseInt(e.target.value) || 1 })}
                                className="h-9 w-24"
                            />
                        </div>

                        {/* Multiple Choice options */}
                        {q.type === 'multiple-choice' && q.options && (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-600">
                                    Options (select the correct answer)
                                </Label>
                                <RadioGroup
                                    value={q.correctAnswer}
                                    onValueChange={(v) => updateQuestion(qIdx, { correctAnswer: v })}
                                >
                                    {q.options.map((opt, optIdx) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={opt.id} id={opt.id} />
                                            <Input
                                                placeholder={`Option ${optIdx + 1}`}
                                                value={opt.text}
                                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                                className="flex-1"
                                            />
                                            {q.options!.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOption(qIdx, optIdx)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </RadioGroup>
                                {q.options.length < 6 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(qIdx)}
                                        className="gap-1 text-sm"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Option
                                    </Button>
                                )}
                                {!q.correctAnswer && (
                                    <p className="text-sm text-amber-600">
                                        Please select the correct answer above
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Text Input correct answer */}
                        {q.type === 'text-input' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">
                                    Accepted Answer (case-insensitive)
                                </Label>
                                <Input
                                    placeholder="Type the correct answer..."
                                    value={q.correctAnswer}
                                    onChange={(e) => updateQuestion(qIdx, { correctAnswer: e.target.value })}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {questions.length > 0 && (
                <Button onClick={addQuestion} variant="outline" className="w-full gap-2 border-dashed border-2 h-12">
                    <Plus className="h-4 w-4" /> Add Another Question
                </Button>
            )}
        </div>
    );
}
