"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Files, Filter, LibraryBig } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Material {
    id: string;
    category: string;
    title: string;
    contentUrl: string | null;
    filePath: string | null;
    createdAt: string;
}

export default function MaterialsPage(): JSX.Element {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterials = async (): Promise<void> => {
            try {
                const response = await apiRequest<{ data: Material[] }>("/api/materials");
                setMaterials(response.data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load materials");
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    if (loading) return <div className="page-container py-10 text-center text-sm font-bold text-slate-600">로딩 중...</div>;
    if (error) return <div className="page-container py-10 text-center text-sm font-bold text-red-500">{error}</div>;

    return (
        <div className="page-container space-y-6 pt-4 sm:pt-6">
            <section className="glass-panel p-6 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <span className="section-label">Materials Library</span>
                        <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">추가 학습 자료 아카이브</h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            공식 자료, 미디어, 요약본을 한 번에 탐색할 수 있도록 자료 목록도 같은 톤으로 정리했습니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="app-button-secondary px-4 py-2.5 text-xs">
                            <Filter className="h-4 w-4" />
                            전체
                        </button>
                        <button className="app-button-secondary px-4 py-2.5 text-xs">공식</button>
                        <button className="app-button-secondary px-4 py-2.5 text-xs">미디어</button>
                        <button className="app-button-secondary px-4 py-2.5 text-xs">요약본</button>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-4">
                        <Files className="h-5 w-5 text-blue-700" />
                        <p className="mt-3 text-sm font-black text-slate-950">자료 유형별 탐색</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-4">
                        <LibraryBig className="h-5 w-5 text-blue-700" />
                        <p className="mt-3 text-sm font-black text-slate-950">목록 가독성 개선</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white/85 p-4">
                        <ArrowUpRight className="h-5 w-5 text-blue-700" />
                        <p className="mt-3 text-sm font-black text-slate-950">즉시 열람 동선 강화</p>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {materials.map((item) => (
                    <div key={item.id} className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.1)]">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-700">
                            {item.category}
                        </span>
                        <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-slate-950">{item.title}</h3>
                        <div className="mt-6 flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <a 
                                href={item.filePath || item.contentUrl || "#"} 
                                className="inline-flex items-center gap-1 text-sm font-black text-blue-700"
                                target="_blank"
                                rel="noreferrer"
                            >
                                자료 보기
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
