"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface WrongAnswer {
    id: string;
    selectedChoice: number | null;
    answeredAt: string;
    question: {
        id: string;
        questionNumber: number;
        contentText: string | null;
        imageUrl: string | null;
        choices: string[] | null;
        answer: number;
        explanation: string | null;
        wrongExplanations: Record<string, string> | null;
        exam: {
            title: string;
            roundNumber: number;
        }
    };
}

export default function WrongNotesPage() {
    const [notes, setNotes] = useState<WrongAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWrongAnswers = async () => {
            try {
                const res = await apiRequest<{ data: WrongAnswer[] }>("/api/users/me/wrong-answers");
                setNotes(res.data);
            } catch (err: any) {
                setError(err.message || "오답 노트를 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
            } finally {
                setLoading(false);
            }
        };
        fetchWrongAnswers();
    }, []);

    if (loading) return <div className="text-center py-20 font-bold">오답 노트 불러오는 중...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

    if (notes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">저장된 오답이 없습니다.</h1>
                <p className="text-gray-600 mb-6">문제 풀이를 진행하면서 틀린 문제들이 이곳에 모입니다.</p>
                <Link href="/cbt" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                    CBT 기출문제 풀러가기
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">나의 오답 노트</h1>
            <p className="text-gray-600">틀렸던 문제들을 다시 복습해보세요.</p>
            
            <div className="space-y-8">
                {notes.map((note) => {
                    const q = note.question;
                    return (
                        <div key={note.id} className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">
                                    오답기록
                                </span>
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-semibold border">
                                    {q.exam?.title}
                                </span>
                                <span className="text-sm text-gray-500 ml-auto">
                                    {new Date(note.answeredAt).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {q.questionNumber}
                                </div>
                                <p className="text-lg font-medium whitespace-pre-wrap">{q.contentText || "문제 내용이 없습니다."}</p>
                            </div>

                            {q.imageUrl && (
                                <div className="bg-gray-50 rounded-lg mb-6 flex justify-center p-4 border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={q.imageUrl} alt="자료" className="max-w-full max-h-64 object-contain" />
                                </div>
                            )}

                            {/* Options with Original Answer highlighted */}
                            <div className="space-y-2 mb-6">
                                {[1, 2, 3, 4, 5].map((num) => {
                                    const choiceText = (q.choices && q.choices.length >= num) ? q.choices[num - 1] : `${num}번 보기`;
                                    
                                    let style = "border-gray-200 bg-gray-50 text-gray-800 opacity-60";
                                    let badge = null;
                                    
                                    if (num === q.answer) {
                                        style = "border-green-500 bg-green-50 text-green-900 border-2 font-bold opacity-100";
                                        badge = <span className="text-xs bg-green-200 text-green-800 px-1 rounded absolute -top-2 right-2">정답</span>;
                                    } else if (num === note.selectedChoice) {
                                        style = "border-red-500 bg-red-50 text-red-900 border-2 font-bold opacity-100 line-through decoration-red-400";
                                        badge = <span className="text-xs bg-red-200 text-red-800 px-1 rounded absolute -top-2 right-2">내가 고른 답</span>;
                                    }

                                    return (
                                        <div key={num} className={`relative w-full text-left px-4 py-3 border rounded-lg flex items-center gap-3 ${style}`}>
                                            <div className="flex-shrink-0 font-bold">{num}번</div>
                                            <span className="flex-1">{choiceText}</span>
                                            {badge}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4">
                                <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                                    💡 정답 해설
                                </h4>
                                <p className="text-red-700 bg-white p-3 rounded">{q.explanation}</p>
                                
                                {q.wrongExplanations && Object.keys(q.wrongExplanations).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold text-red-800 mb-2">❌ 오답 보기 해설</h4>
                                        <div className="space-y-2 text-sm bg-white p-3 rounded">
                                            {Object.entries(q.wrongExplanations).map(([num, exp]) => (
                                                <div key={num} className="flex items-start gap-2">
                                                    <span className="font-bold text-gray-700 border-b">{num}번</span>
                                                    <span className="text-red-600" dangerouslySetInnerHTML={{ __html: exp.replace(/🔴 핵심/g, '<strong class="bg-red-200 px-1 rounded">🔴 핵심</strong>') }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
