"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, CheckCircle2, ChevronRight, Sparkles, Search, Loader2 } from "lucide-react";
import { ERA_LIST } from "./eraList";

export default function EducationSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        setSearching(true);
        setSearchError("");

        try {
            const res = await fetch(`/api/education/search?q=${encodeURIComponent(trimmed)}`);
            const data = await res.json();

            if (data.success && data.eraId) {
                router.push(`/education/${data.eraId}?search=${encodeURIComponent(trimmed)}`);
            } else {
                setSearchError(data.message || "검색 결과가 없습니다.");
                setTimeout(() => setSearchError(""), 3000);
            }
        } catch (err) {
            console.error("Search API connection failed", err);
            setSearchError("네트워크 오류가 발생했습니다.");
            setTimeout(() => setSearchError(""), 3000);
        } finally {
            setSearching(false);
        }
    };

    return (
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto no-scrollbar pb-6">
            <div className="glass-panel overflow-hidden p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="section-label">Learning Index</span>
                        <h2 className="mt-3 text-xl font-black tracking-[-0.04em] text-slate-950">학습 로드맵</h2>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <BookOpenCheck className="h-5 w-5" />
                    </div>
                </div>

                {/* Full-Text Search Bar */}
                <form onSubmit={handleSearch} className="mt-4 relative">
                    <input
                        type="text"
                        placeholder="역사 키워드 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={searching}
                        className="w-full pl-9 pr-12 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {searching ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        ) : (
                            <Search className="h-3.5 w-3.5" />
                        )}
                    </div>
                    {searchQuery && (
                        <button
                            type="submit"
                            disabled={searching}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2 py-1 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 text-[10px] font-bold"
                        >
                            이동
                        </button>
                    )}
                </form>
                {searchError && (
                    <p className="mt-2 text-center text-[10px] font-extrabold text-red-500 animate-pulse">
                        {searchError}
                    </p>
                )}

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
                                            {era.title}
                                        </p>
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
