"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Exam {
    id: string;
    roundNumber: number;
    level: string;
}

export default function CBTList() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await apiRequest<{ data: Exam[] }>("/api/exams");
                setExams(response.data);
            } catch (error) {
                console.error("Failed to fetch exams:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading) return <div className="text-center py-20 font-bold">시험 목록 불러오는 중...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">CBT 기출문제</h1>
                <Link href="/cbt/wrong-notes" className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                    📝 나의 오답 노트 가기
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => (
                    <Link 
                        key={exam.id} 
                        href={`/cbt/${exam.id}`}
                        className="block p-6 bg-white rounded-xl shadow-md border hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <h2 className="text-xl font-bold text-blue-800 mb-2">제 {exam.roundNumber}회 한국사능력검정시험 ({exam.level})</h2>
                        <p className="text-gray-600">실전처럼 문제를 풀고 채점 결과를 확인해보세요.</p>
                        <div className="mt-4 inline-flex items-center text-blue-600 font-semibold">
                            응시하기 &rarr;
                        </div>
                    </Link>
                ))}
            </div>
            {exams.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    현재 등록된 시험이 없습니다.
                </div>
            )}
        </div>
    );
}
