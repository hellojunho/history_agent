import fs from "fs";
import path from "path";
import { Suspense } from "react";
import SummaryViewer from "../SummaryViewer";
import { ERA_LIST } from "../eraList";

export async function generateStaticParams() {
    return ERA_LIST.map((era) => ({
        era: era.id,
    }));
}

export default async function EraPage({ params }: { params: { era: string } }) {
    const eraId = params.era;
    const currentEra = ERA_LIST.find((e) => e.id === eraId);
    const eraTitle = currentEra?.title || "시대 정보 없음";
    
    // Read all files in the era directory
    const dirPath = path.join(process.cwd(), "src/data/history_deep", eraId);
    let combinedContent = "";

    try {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
            
            // Sort files so that 정치 comes first, then 경제, 사회, 문화...
            files.sort((a, b) => {
                const order = ["정치.md", "경제.md", "사회.md", "문화.md", "대외관계.md"];
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const fileContent = fs.readFileSync(filePath, "utf-8");
                combinedContent += `\n\n---\n\n${fileContent}`;
            }
        } else {
            combinedContent += "데이터를 수집 중이거나 해당 시대의 자료가 없습니다.";
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        combinedContent += "자료를 불러오는 중 오류가 발생했습니다.";
    }

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-[30px] border border-blue-100 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96)_42%,rgba(245,158,11,0.08))] p-6 sm:p-7">
                <span className="section-label">Era Overview</span>
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{eraTitle}</h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            {eraTitle} 파트의 핵심 흐름을 먼저 읽고, 하단 요약과 기출 퀴즈로 바로 기억을 고정하세요.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:max-w-sm sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/80 bg-white/85 p-4">
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Format</p>
                            <p className="mt-2 font-black text-slate-950">정치 · 경제 · 사회 · 문화</p>
                        </div>
                        <div className="rounded-2xl border border-white/80 bg-white/85 p-4">
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Review</p>
                            <p className="mt-2 font-black text-slate-950">요약 + 3문항 점검</p>
                        </div>
                    </div>
                </div>
            </section>

            <Suspense fallback={<div className="glass-panel text-center py-20 text-sm font-bold text-slate-500 animate-pulse">역사자료 요약 및 퀴즈 데이터를 불러오는 중...</div>}>
                <SummaryViewer content={combinedContent} eraId={eraId} />
            </Suspense>
        </div>
    );
}
