"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

interface ScoringResult {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string | null;
}

interface BackendResult {
    score: number;
    passed: boolean;
    results: ScoringResult[];
}

export default function CBTResultPage({ params }: { params: { examId: string } }) {
    const { examId } = params;
    const [result, setResult] = useState<BackendResult | null>(null);

    useEffect(() => {
        // Read the result from localStorage
        const stored = localStorage.getItem(`cbt-backend-result-${examId}`);
        if (stored) {
            try {
                setResult(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse result", e);
            }
        }
    }, [examId]);

    if (!result) {
        return (
            <div className="text-center py-20">
                <p className="text-lg font-bold mb-4">채점 결과가 없습니다.</p>
                <Link href={`/cbt/${examId}`} className="text-blue-600 underline">다시 시험 보기</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="bg-white p-8 rounded-xl shadow border text-center">
                <h1 className="text-3xl font-bold mb-2">시험 채점 결과</h1>
                <div className={`text-5xl font-extrabold my-6 ${result.passed ? 'text-blue-600' : 'text-red-600'}`}>
                    {result.score}점
                </div>
                <p className="text-lg font-semibold text-gray-700">
                    {result.passed ? '축하합니다! 합격 기준을 충족했습니다.' : '아쉽습니다. 다음에는 더 좋은 결과가 있을 거예요!'}
                </p>
                <div className="mt-8 space-x-4">
                    <Link href="/cbt" className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition">
                        목록으로
                    </Link>
                    <Link href={`/cbt/${examId}`} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                        다시 풀기
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">문제별 해설</h2>
                {result.results.map((item, index) => (
                    <div key={item.questionId} className={`p-5 rounded-lg border-2 ${item.isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {item.isCorrect ? <CheckCircle className="text-blue-600 w-6 h-6" /> : <XCircle className="text-red-600 w-6 h-6" />}
                            <h3 className="font-bold text-lg">{index + 1}번 문제</h3>
                            <span className="ml-auto font-bold text-sm bg-white px-2 py-1 rounded border">정답: {item.correctAnswer}번</span>
                        </div>
                        {item.explanation && (
                            <p className="mt-3 text-gray-700 leading-relaxed bg-white p-4 rounded border">
                                💡 <strong>해설:</strong> {item.explanation}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
