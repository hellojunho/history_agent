"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface Question {
    id: string;
    examId: string;
    questionNumber: number;
    contentText: string | null;
    imageUrl: string | null;
    choices: string[] | null;
    answer: number;
    explanation: string | null;
    wrongExplanations: Record<string, string> | null;
    era: string | null;
    topic: string | null;
    difficulty: string | null;
    frequentConcept: boolean;
}

export default function ExamCBTPage({ params }: { params: { examId: string } }) {
    const { examId } = params;
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // answers[questionId] = user's selected choice
    const [answers, setAnswers] = useState<Record<string, number>>({});
    // evaluated[questionId] = boolean (true if user submitted this question)
    const [evaluated, setEvaluated] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await apiRequest<{ questions: Question[] }>(`/api/exams/${examId}/questions`);
                if (response.questions.length === 0) {
                    setError("등록된 문제가 없습니다.");
                } else {
                    setQuestions(response.questions);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load questions");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [examId]);

    const handleAnswerSelect = (choice: number) => {
        const q = questions[currentIndex];
        if (evaluated[q.id]) return; // 이미 풀이/평가 완료된 경우 변경 불가
        setAnswers(prev => ({ ...prev, [q.id]: choice }));
    };

    const handleEvaluate = () => {
        const q = questions[currentIndex];
        if (!answers[q.id]) {
            alert("답을 선택해주세요.");
            return;
        }
        setEvaluated(prev => ({ ...prev, [q.id]: true }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmitExam = async () => {
        if (Object.keys(answers).length < questions.length) {
            if (!confirm("아직 풀지 않은 문제가 있습니다. 제출하시겠습니까?")) return;
        }
        
        setSubmitting(true);
        try {
            const answerPayload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer
            }));
            
            localStorage.setItem(`cbt-result-${examId}`, JSON.stringify(answerPayload));

            const response = await apiRequest(`/api/exams/${examId}/submit`, {
                method: "POST",
                body: JSON.stringify({ answers: answerPayload })
            });

            localStorage.setItem(`cbt-backend-result-${examId}`, JSON.stringify(response));
            router.push(`/cbt/${examId}/result`);
        } catch (err) {
            console.error("Submit error", err);
            router.push(`/cbt/${examId}/result`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-bold">기출문제 불러오는 중...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    const q = questions[currentIndex];
    const isEvaluated = evaluated[q.id];
    const selectedAnswer = answers[q.id];
    const isCorrect = selectedAnswer === q.answer;
    
    // 계산된 진행률
    const progress = Math.round((Object.keys(evaluated).length / questions.length) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header / Progress */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                <div className="font-bold text-lg text-gray-800">CBT 모의고사</div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-gray-600">진행률 {progress}%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow border">
                {/* Question Info */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {q.questionNumber}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {q.era && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border font-semibold">{q.era}</span>}
                            {q.topic && <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border font-semibold">{q.topic}</span>}
                            {q.frequentConcept && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border font-bold">⭐ 빈출</span>}
                        </div>
                        <p className="text-xl font-medium whitespace-pre-wrap">{q.contentText || "다음 문제를 푸시오."}</p>
                    </div>
                    {isEvaluated && (
                        <div className="ml-auto flex-shrink-0">
                            {isCorrect ? (
                                <div className="text-blue-600 flex items-center gap-2 font-extrabold text-xl">
                                    <CheckCircle className="w-8 h-8" /> 정답
                                </div>
                            ) : (
                                <div className="text-red-500 flex items-center gap-2 font-extrabold text-xl">
                                    <XCircle className="w-8 h-8" /> 오답
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Resource/Image */}
                {q.imageUrl && (
                    <div className="bg-gray-50 rounded-lg mb-8 flex justify-center p-6 border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={q.imageUrl} alt={`문제 ${q.questionNumber} 자료`} className="max-w-full max-h-96 object-contain" />
                    </div>
                )}

                {/* Choices */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const choiceText = (q.choices && q.choices.length >= num) ? q.choices[num - 1] : `${num}번 선택지`;
                        const isSelected = selectedAnswer === num;
                        let itemStyle = "border-gray-200 hover:bg-gray-50 text-gray-800 cursor-pointer";
                        
                        if (isSelected) {
                            itemStyle = "border-blue-500 bg-blue-50 text-blue-900";
                        }
                        
                        if (isEvaluated) {
                            itemStyle = "border-gray-200 opacity-60 cursor-not-allowed bg-gray-50"; // Dim base
                            if (num === q.answer) { // correct answer highlighted
                                itemStyle = "border-green-500 bg-green-50 text-green-900 font-bold border-2";
                            } else if (isSelected && num !== q.answer) { // wrong selected highlighted
                                itemStyle = "border-red-500 bg-red-50 text-red-900 font-bold border-2 line-through decoration-red-400";
                            }
                        }

                        return (
                            <button
                                key={num}
                                onClick={() => handleAnswerSelect(num)}
                                disabled={isEvaluated}
                                className={`w-full text-left px-5 py-4 border rounded-xl flex items-center gap-4 transition-all ${itemStyle}`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold
                                    ${isSelected ? 'border-blue-600 text-blue-600' : 'border-gray-400 text-gray-500'}
                                    ${isEvaluated && num === q.answer ? 'border-green-600 bg-green-600 text-white' : ''}
                                    ${isEvaluated && isSelected && num !== q.answer ? 'border-red-600 bg-red-600 text-white' : ''}
                                `}>
                                    {num}
                                </div>
                                <span className="text-lg flex-1">{choiceText}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Submit / Navigation */}
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentIndex === 0}
                        className="px-6 py-3 font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-30 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> 이전 문제
                    </button>
                    
                    {!isEvaluated ? (
                        <button 
                            onClick={handleEvaluate}
                            className="px-8 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transform transition hover:-translate-y-0.5"
                        >
                            정답 확인
                        </button>
                    ) : (
                        currentIndex < questions.length - 1 ? (
                            <button 
                                onClick={handleNext}
                                className="px-8 py-3 font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 shadow-md flex items-center gap-2"
                            >
                                다음 문제 <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmitExam}
                                disabled={submitting}
                                className="px-8 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md max-w-sm"
                            >
                                {submitting ? "채점 중..." : "시험 종료 및 최종 결과 보기"}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Explanation Area */}
            {isEvaluated && (
                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-extrabold text-red-700 text-xl border-b border-red-200 pb-3 mb-4 flex items-center gap-2">
                        💡 정답 및 해설
                    </h3>
                    
                    {!isCorrect && (
                        <p className="text-red-700 font-bold mb-4 bg-red-100 p-3 rounded">
                            오답입니다. 정답은 <span className="text-lg underline underline-offset-2">{q.answer}번</span> 입니다.
                        </p>
                    )}
                    
                    {q.explanation && (
                        <div className="mb-6">
                            <h4 className="font-bold text-red-800 mb-2">✅ 정답 해설 ({q.answer}번)</h4>
                            <p className="text-red-600 leading-relaxed bg-white border border-red-100 p-4 rounded-lg">
                                {q.explanation}
                            </p>
                        </div>
                    )}
                    
                    {q.wrongExplanations && Object.keys(q.wrongExplanations).length > 0 && (
                        <div>
                            <h4 className="font-bold text-red-800 mt-6 mb-3">❌ 오답 보기 해설</h4>
                            <div className="space-y-3">
                                {[1,2,3,4,5].filter(num => num !== q.answer).map(num => {
                                    const wrongExp = q.wrongExplanations?.[num.toString()];
                                    if (!wrongExp) return null;
                                    const choiceText = (q.choices && q.choices.length >= num) ? q.choices[num - 1] : '';
                                    return (
                                        <div key={num} className="bg-white border border-red-100 p-4 rounded-lg flex flex-col gap-2">
                                            <div className="text-gray-800 font-medium bg-gray-50 p-2 rounded -mx-2 -mt-2 mb-1 border-b border-gray-100">
                                                <span className="font-bold text-gray-500 mr-2">{num}번</span> {choiceText}
                                            </div>
                                            <div className="text-red-600 flex items-start gap-2">
                                                <span className="font-bold text-red-500 flex-shrink-0">→</span>
                                                <span dangerouslySetInnerHTML={{ __html: wrongExp.replace(/🔴 핵심/g, '<strong class="bg-red-200 px-1 rounded">🔴 핵심</strong>') }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
