"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileWarning, PenSquare, ScanSearch } from "lucide-react";
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

    if (loading) return <div className="page-container py-20 text-center text-sm font-bold text-slate-600">시험 목록 불러오는 중...</div>;

    return (
        <div className="page-container space-y-6 pt-4 sm:pt-6">
            <section className="glass-panel overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <span className="section-label">CBT Practice</span>
                        <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">실전처럼 푸는 CBT 기출문제</h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            문제 풀이, 채점, 오답 복습까지 한 흐름으로 이어지도록 실전 연습 공간을 정리했습니다.
                        </p>
                    </div>
                    <Link href="/cbt/wrong-notes" className="app-button-secondary self-start text-sm">
                        <PenSquare className="h-4 w-4" />
                        나의 오답 노트
                    </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Practice</p>
                        <p className="mt-2 text-sm font-black text-slate-950">실전형 시험 리스트</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Review</p>
                        <p className="mt-2 text-sm font-black text-slate-950">채점 후 약점 확인</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Retention</p>
                        <p className="mt-2 text-sm font-black text-slate-950">오답 노트 연동</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {exams.map((exam) => (
                    <Link 
                        key={exam.id} 
                        href={`/cbt/${exam.id}`}
                        className="group rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_48px_rgba(15,23,42,0.1)]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-700">
                                    <ScanSearch className="h-3.5 w-3.5" />
                                    CBT Session
                                </div>
                                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                                    제 {exam.roundNumber}회 한국사능력검정시험 ({exam.level})
                                </h2>
                                <p className="text-sm leading-7 text-slate-600">
                                    실전과 유사한 흐름으로 문제를 풀고 채점 결과를 확인해보세요.
                                </p>
                            </div>
                            <span className="rounded-2xl bg-slate-950 p-3 text-white transition-transform group-hover:translate-x-1">
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
            {exams.length === 0 && (
                <div className="soft-panel flex items-center gap-3 p-6 text-sm text-slate-600">
                    <FileWarning className="h-5 w-5 text-amber-600" />
                    현재 등록된 시험이 없습니다.
                </div>
            )}
        </div>
    );
}
