"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { ERA_LIST } from "./eraList";

export default function EducationSidebar() {
    const pathname = usePathname();

    return (
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="glass-panel overflow-hidden p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="section-label">Learning Index</span>
                        <h2 className="mt-3 text-xl font-black tracking-[-0.04em] text-slate-950">시대별 학습 로드맵</h2>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>
                </div>

                <nav className="mt-5 grid gap-2">
                    {ERA_LIST.map((era, index) => {
                        const href = `/education/${era.id}`;
                        const isActive = pathname === href;

                        return (
                            <Link
                                key={era.id}
                                href={href}
                                className={`group rounded-[22px] border px-4 py-3 transition-all ${
                                    isActive
                                        ? "border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                                        : "border-slate-200/70 bg-white/80 text-slate-700 hover:border-blue-200 hover:bg-blue-50/70"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                                            isActive ? "bg-white/16 text-white" : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm font-black ${isActive ? "text-white" : "text-slate-950"}`}>
                                            {era.shortLabel}
                                        </p>
                                        {/* <p className={`truncate text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                                            {era.title}
                                        </p> */}
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="soft-panel p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">Study Tip</p>
                        <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-slate-950">추천 학습 루틴</h3>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            15분 맥락 읽기
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">본문을 먼저 훑으며 사건의 앞뒤 관계를 잡습니다.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            5분 핵심 요약
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">요약 모달에서 출제 가능성이 높은 개념만 다시 확인합니다.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            3문항 퀴즈 점검
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">틀린 개념은 바로 다음 시대로 넘어가기 전에 다시 정리합니다.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
