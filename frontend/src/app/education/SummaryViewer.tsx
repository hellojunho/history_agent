"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, ChevronRight, CheckCircle2, HelpCircle } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";
import { ERA_SUMMARIES } from "../../data/eraSummaries";
import { HISTORY_QUIZZES, HistoryQuiz } from "../../data/historyQuizzes";

interface Props {
    content: string;
    eraId: string;
}

export default function SummaryViewer({ content, eraId }: Props) {
    const router = useRouter();

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            const eventSource = new EventSource("/api/dev-watch");
            
            eventSource.onmessage = (event) => {
                if (event.data === "reload") {
                    console.log("[DevWatch] Change detected! Triggering page refresh...");
                    router.refresh();
                }
            };
            
            return () => {
                eventSource.close();
            };
        }
    }, [router]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const summary = ERA_SUMMARIES[eraId];
    
    // Dynamic multiple-choice quiz state
    const [currentQuizzes, setCurrentQuizzes] = useState<HistoryQuiz[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
    const [quizChecked, setQuizChecked] = useState<Record<string, boolean>>({});
    const [previousRecords, setPreviousRecords] = useState<Record<string, "correct" | "wrong">>({});

    const handleQuizClick = (quiz: HistoryQuiz, choiceIdx: number) => {
        if (quizChecked[quiz.id]) return; // prevent multiple attempts
        
        const isCorrect = choiceIdx === quiz.answer;
        setQuizAnswers(prev => ({ ...prev, [quiz.id]: choiceIdx }));
        setQuizChecked(prev => ({ ...prev, [quiz.id]: true }));

        // Save to localStorage
        const recordsKey = "antigravity_history_quiz_records";
        try {
            const existingStr = localStorage.getItem(recordsKey);
            const existing: Record<string, "correct" | "wrong"> = existingStr ? JSON.parse(existingStr) : {};
            existing[quiz.id] = isCorrect ? "correct" : "wrong";
            localStorage.setItem(recordsKey, JSON.stringify(existing));
            
            // Update local state instantly so the tags dynamically update
            setPreviousRecords(prev => ({
                ...prev,
                [quiz.id]: isCorrect ? "correct" : "wrong"
            }));
        } catch (e) {
            console.error("Failed to access localStorage for quiz records", e);
        }
    };

    const resetQuiz = () => {
        setQuizAnswers({});
        setQuizChecked({});
    };

    const handleOpenModal = () => {
        resetQuiz();
        
        // Load quiz records from localStorage
        const recordsKey = "antigravity_history_quiz_records";
        try {
            const existingStr = localStorage.getItem(recordsKey);
            const existing: Record<string, "correct" | "wrong"> = existingStr ? JSON.parse(existingStr) : {};
            setPreviousRecords(existing);
        } catch (e) {
            console.error("Failed to load quiz records", e);
        }

        // Shuffle and select 3 quizzes for this era
        const allQuizzes = HISTORY_QUIZZES[eraId] || [];
        if (allQuizzes.length > 0) {
            const shuffled = [...allQuizzes]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            setCurrentQuizzes(shuffled);
        } else {
            setCurrentQuizzes([]);
        }

        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "unset";
    };

    return (
        <div className="space-y-12">
            {/* Main Markdown Content */}
            <MarkdownViewer content={content} />

            {/* Bottom Floating/Fixed Summary Action Card */}
            <div className="animated-border relative mt-16 overflow-hidden rounded-[32px] border border-blue-200/40 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.92)_45%,rgba(245,158,11,0.08))] p-8 text-center shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-blue-700">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    공부가 다 끝났다면?
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-slate-950 sm:text-2xl">
                    방금 배운 {summary?.title || "이 시대"}의 핵심 내용을 1분 만에 훑어보세요.
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                    한능검 시험에 자주 등장하는 킬러 기출 선지 분석과 OX 퀴즈를 풀고 암기를 마무리할 수 있습니다.
                </p>
                <div className="pt-4">
                    <button
                        onClick={handleOpenModal}
                        className="app-button-primary w-full px-10 py-4 text-base sm:w-auto"
                    >
                        요약본 & 기출 퀴즈 풀기
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Toss Premium Bottom Sheet / Modal */}
            {isModalOpen && summary && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-6">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />

                    {/* Sheet Content */}
                    <div className="animate-slide-up relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)] md:max-h-[90vh] md:rounded-[32px]">
                        {/* Header */}
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/96 px-6 py-5 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <span className="rounded-xl bg-blue-600/10 p-2 text-blue-700">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                <h2 className="font-extrabold text-toss-gray900 text-lg tracking-tight">
                                    {summary.title} 핵심 요약본
                                </h2>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100 active:scale-90"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 space-y-8 overflow-y-auto p-6 pb-12">
                            {/* Section 1: Overview */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">01. 30초 초고속 맥락 잡기</h3>
                                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
                                    <p className="text-sm font-semibold leading-7 text-slate-700">
                                        {summary.overview}
                                    </p>
                                </div>
                            </div>

                            {/* Section 2: Core Concepts */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">02. 시험 직전 킬러 개념 정리</h3>
                                <div className="space-y-3">
                                    {summary.coreConcepts.map((concept, idx) => (
                                        <div key={idx} className="group rounded-[24px] border border-slate-200/70 bg-white p-5 transition-all hover:border-blue-200 hover:bg-blue-50/40">
                                            <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                {concept.topic}
                                            </h4>
                                            <p className="pl-3.5 text-sm leading-7 text-slate-600">
                                                {concept.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Keywords */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">03. 뇌에 새기는 한능검 빈출 키워드</h3>
                                <div className="flex flex-wrap gap-2">
                                    {summary.frequentKeywords.map((word, idx) => (
                                        <span 
                                            key={idx} 
                                            className="cursor-default rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-blue-100 hover:text-blue-700"
                                        >
                                            #{word}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4: Multiple-Choice Quiz */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                                    04. 한능검 실전 기출 퀴즈 (무작위 3문항)
                                </h3>
                                <div className="space-y-4">
                                    {currentQuizzes.map((q, idx) => {
                                        const isAnswered = quizChecked[q.id];
                                        const userAns = quizAnswers[q.id];
                                        const isCorrect = userAns === q.answer;
                                        const prevRecord = previousRecords[q.id];

                                        return (
                                            <div key={q.id} className="space-y-3.5 rounded-[24px] border border-slate-200/80 bg-white p-5 transition-all">
                                                {/* Toss Badge indicating past result */}
                                                {prevRecord && (
                                                    <div className="flex">
                                                        {prevRecord === "correct" ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200/60 bg-green-50 px-2.5 py-1 text-[10px] font-extrabold leading-none tracking-tight text-green-600">
                                                                ✓ 지난 번에 맞혔던 문제에요
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-red-200/60 bg-red-50 px-2.5 py-1 text-[10px] font-extrabold leading-none tracking-tight text-red-600">
                                                                ✗ 지난 번에 틀렸던 문제에요
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Question Text */}
                                                <div className="flex gap-2">
                                                    <span className="mt-0.5 flex-shrink-0 text-sm font-extrabold text-blue-700">Q{idx + 1}.</span>
                                                    <p className="text-sm font-extrabold leading-7 text-slate-950">
                                                        {q.question}
                                                    </p>
                                                </div>

                                                {/* Material Card (사료) */}
                                                {q.materials && (
                                                    <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-xs font-semibold leading-6 text-slate-700">
                                                        {q.materials}
                                                    </div>
                                                )}

                                                {/* Options Buttons */}
                                                <div className="flex flex-col gap-2.5">
                                                    {q.options.map((option, optIdx) => {
                                                        const isSelected = userAns === optIdx;
                                                        const isCorrectAns = optIdx === q.answer;

                                                        let btnStyle = "border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300";
                                                        if (isAnswered) {
                                                            if (isCorrectAns) {
                                                                btnStyle = "border-green-500 bg-green-50 text-green-700 font-extrabold shadow-sm";
                                                            } else if (isSelected) {
                                                                btnStyle = "border-red-500 bg-red-50 text-red-700 font-extrabold";
                                                            } else {
                                                                btnStyle = "border-slate-100 text-slate-400 opacity-60 cursor-not-allowed";
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={optIdx}
                                                                disabled={isAnswered}
                                                                onClick={() => handleQuizClick(q, optIdx)}
                                                                className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-all ${btnStyle} ${!isAnswered ? 'active:scale-[0.98]' : ''}`}
                                                            >
                                                                {option}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Feedback & Explanation */}
                                                {isAnswered && (
                                                    <div className="space-y-3 animate-fade-in pt-1">
                                                        {/* Quiz Result Header */}
                                                        <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-xs font-extrabold leading-relaxed ${
                                                            isCorrect ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                                                        }`}>
                                                            {isCorrect ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                                    정답입니다! 완벽해요. (정답: {q.answer + 1}번)
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <HelpCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                                    아쉽게도 틀렸습니다. (정답: {q.answer + 1}번)
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Explanation Card */}
                                                        <div className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-50 p-5">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                                한능검 합격 해설
                                                            </div>
                                                            <p className="whitespace-pre-wrap pl-3 text-sm leading-7 text-slate-600">
                                                                {q.explanation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom sheet CSS animation injects */}
            <style jsx global>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.25s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
