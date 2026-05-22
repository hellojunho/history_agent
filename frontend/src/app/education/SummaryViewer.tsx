"use client";

import React, { useState } from "react";
import { Sparkles, X, ChevronRight, CheckCircle2, HelpCircle, Printer } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";
import { ERA_SUMMARIES } from "../../data/eraSummaries";
import { HISTORY_QUIZZES, HistoryQuiz } from "../../data/historyQuizzes";

interface Props {
    content: string;
    eraId: string;
}

export default function SummaryViewer({ content, eraId }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const summary = ERA_SUMMARIES[eraId];
    
    // 마크다운 최상단 대제목(# 제목) 추출 및 본문 분리
    let title = "학습자료";
    let bodyContent = content;

    if (content.startsWith("# ")) {
        const firstLineEnd = content.search(/\r?\n/);
        if (firstLineEnd !== -1) {
            title = content.substring(2, firstLineEnd).trim();
            bodyContent = content.substring(firstLineEnd).trim();
        } else {
            title = content.substring(2).trim();
            bodyContent = "";
        }
    }

    const handlePrint = () => {
        window.print();
    };
    
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
            {/* Title & PDF Print Button Header Line */}
            <div className="flex justify-between items-center border-b border-toss-gray200 pb-4 mb-8">
                <h1 className="text-3xl font-extrabold text-toss-gray900 tracking-tight">
                    {title}
                </h1>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-toss-blue bg-toss-blue/10 rounded-2xl hover:bg-toss-blue/20 transition-all active:scale-[0.95] no-print shadow-sm"
                >
                    <Printer className="w-4 h-4" />
                    PDF 출력
                </button>
            </div>

            {/* Main Markdown Content */}
            <MarkdownViewer content={bodyContent} />

            {/* Bottom Floating/Fixed Summary Action Card */}
            <div className="mt-16 bg-gradient-to-r from-toss-blue/5 to-blue-600/5 border border-toss-blue/20 rounded-toss p-8 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center gap-1 bg-toss-blue/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-toss-blue tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    공부가 다 끝났다면?
                </div>
                <h3 className="font-extrabold text-toss-gray900 text-xl tracking-tight">
                    방금 배운 {summary?.title || "이 시대"}의 핵심 내용을 1분 만에 훑어보세요.
                </h3>
                <p className="text-toss-gray600 text-sm max-w-md mx-auto">
                    한능검 시험에 자주 등장하는 킬러 기출 선지 분석과 OX 퀴즈를 풀고 암기를 마무리할 수 있습니다.
                </p>
                <div className="pt-2">
                    <button
                        onClick={handleOpenModal}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-toss-blue text-white font-extrabold rounded-2xl hover:bg-toss-blueHover transition-all shadow-md active:scale-95 text-base"
                    >
                        요약본 & 기출 퀴즈 풀기
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Toss Premium Bottom Sheet / Modal */}
            {isModalOpen && summary && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-300">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-toss-gray900/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />

                    {/* Sheet Content */}
                    <div className="relative w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-slide-up">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-toss-gray100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-2">
                                <span className="bg-toss-blue/10 p-1.5 rounded-xl text-toss-blue">
                                    <Sparkles className="w-4 h-4" />
                                </span>
                                <h2 className="font-extrabold text-toss-gray900 text-lg tracking-tight">
                                    {summary.title} 핵심 요약본
                                </h2>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 rounded-xl text-toss-gray600 hover:bg-toss-gray100 active:scale-90 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
                            {/* Section 1: Overview */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-toss-blue uppercase tracking-wider">01. 30초 초고속 맥락 잡기</h3>
                                <div className="bg-toss-gray100 p-5 rounded-2xl border border-toss-gray200/50">
                                    <p className="text-toss-gray800 text-sm font-semibold leading-relaxed">
                                        {summary.overview}
                                    </p>
                                </div>
                            </div>

                            {/* Section 2: Core Concepts */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-toss-blue uppercase tracking-wider">02. 시험 직전 킬러 개념 정리</h3>
                                <div className="space-y-3">
                                    {summary.coreConcepts.map((concept, idx) => (
                                        <div key={idx} className="border border-toss-gray200/60 p-5 rounded-2xl hover:border-toss-blue/30 hover:bg-toss-blue/5 transition-all group">
                                            <h4 className="font-bold text-toss-gray950 text-sm mb-1.5 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-toss-blue rounded-full" />
                                                {concept.topic}
                                            </h4>
                                            <p className="text-toss-gray650 text-xs leading-relaxed pl-3.5">
                                                {concept.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Keywords */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-toss-blue uppercase tracking-wider">03. 뇌에 새기는 한능검 빈출 키워드</h3>
                                <div className="flex flex-wrap gap-2">
                                    {summary.frequentKeywords.map((word, idx) => (
                                        <span 
                                            key={idx} 
                                            className="px-3.5 py-2 bg-toss-gray100 hover:bg-toss-blue/10 hover:text-toss-blue text-toss-gray800 font-bold rounded-xl text-xs transition-colors cursor-default"
                                        >
                                            #{word}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Section 4: Multiple-Choice Quiz */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-toss-blue uppercase tracking-wider flex items-center gap-1.5">
                                    04. 한능검 실전 기출 퀴즈 (무작위 3문항)
                                </h3>
                                <div className="space-y-4">
                                    {currentQuizzes.map((q, idx) => {
                                        const isAnswered = quizChecked[q.id];
                                        const userAns = quizAnswers[q.id];
                                        const isCorrect = userAns === q.answer;
                                        const prevRecord = previousRecords[q.id];

                                        return (
                                            <div key={q.id} className="bg-white border border-toss-gray200 rounded-2xl p-5 space-y-3.5 transition-all">
                                                {/* Toss Badge indicating past result */}
                                                {prevRecord && (
                                                    <div className="flex">
                                                        {prevRecord === "correct" ? (
                                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold leading-none tracking-tight">
                                                                ✓ 지난 번에 맞혔던 문제에요
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold leading-none tracking-tight">
                                                                ✗ 지난 번에 틀렸던 문제에요
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Question Text */}
                                                <div className="flex gap-2">
                                                    <span className="text-toss-blue font-extrabold text-sm flex-shrink-0 mt-0.5">Q{idx + 1}.</span>
                                                    <p className="text-toss-gray900 font-extrabold text-sm leading-relaxed">
                                                        {q.question}
                                                    </p>
                                                </div>

                                                {/* Material Card (사료) */}
                                                {q.materials && (
                                                    <div className="bg-toss-gray100 p-4 rounded-xl border border-toss-gray200/50 text-xs text-toss-gray700 leading-relaxed font-semibold">
                                                        {q.materials}
                                                    </div>
                                                )}

                                                {/* Options Buttons */}
                                                <div className="flex flex-col gap-2.5">
                                                    {q.options.map((option, optIdx) => {
                                                        const isSelected = userAns === optIdx;
                                                        const isCorrectAns = optIdx === q.answer;

                                                        let btnStyle = "border-toss-gray200 text-toss-gray800 hover:bg-toss-gray50 hover:border-toss-gray300";
                                                        if (isAnswered) {
                                                            if (isCorrectAns) {
                                                                btnStyle = "border-green-500 bg-green-50 text-green-700 font-extrabold shadow-sm";
                                                            } else if (isSelected) {
                                                                btnStyle = "border-red-500 bg-red-50 text-red-700 font-extrabold";
                                                            } else {
                                                                btnStyle = "border-toss-gray100 text-toss-gray400 opacity-60 cursor-not-allowed";
                                                            }
                                                        }

                                                        return (
                                                            <button
                                                                key={optIdx}
                                                                disabled={isAnswered}
                                                                onClick={() => handleQuizClick(q, optIdx)}
                                                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-xs font-semibold ${btnStyle} ${!isAnswered ? 'active:scale-[0.98]' : ''}`}
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
                                                        <div className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-extrabold leading-relaxed ${
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
                                                        <div className="bg-toss-gray50 p-5 rounded-xl border border-toss-gray200/40 space-y-2">
                                                            <div className="font-bold text-toss-gray800 text-xs flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 bg-toss-blue rounded-full" />
                                                                💡 한능검 합격 해설
                                                            </div>
                                                            <p className="text-toss-gray600 text-xs leading-relaxed whitespace-pre-wrap pl-3">
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
                .text-toss-gray650 {
                    color: #4e5968;
                }
                .text-toss-gray950 {
                    color: #191f28;
                }

                /* PDF 인쇄 전용 스타일 시트 최적화 */
                @media print {
                    /* 불필요한 UI 비노출 */
                    .no-print,
                    header,
                    footer,
                    nav,
                    aside,
                    .mt-16,
                    button,
                    .bg-gradient-to-r {
                        display: none !important;
                    }
                    
                    /* 전체 레이아웃 리셋 */
                    body, html, main, #__next, .prose {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    /* 페이지 걸침 오류(잘림) 제어 */
                    h1, h2, h3, h4, h5 {
                        page-break-after: avoid;
                        page-break-inside: avoid;
                    }
                    
                    img, table, pre, blockquote, .prose p, tr {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
