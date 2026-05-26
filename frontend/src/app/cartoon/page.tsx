"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface CartoonEpisode {
    id: number;
    period: string;
    periodOrder: number;
    title: string;
    description: string;
    thumbnail: string;
    order: number;
}

const PERIOD_METADATA: Record<string, { bg: string; text: string; desc: string; emoji: string }> = {
    "삼국시대": {
        bg: "from-blue-500/10 to-indigo-500/10 border-blue-200 hover:border-blue-400",
        text: "text-blue-600",
        desc: "고구려, 백제, 신라의 건국과 격동의 삼국 통일 과정",
        emoji: "⚔️"
    },
    "고려시대": {
        bg: "from-amber-500/10 to-orange-500/10 border-amber-200 hover:border-amber-400",
        text: "text-amber-600",
        desc: "호족 융합과 찬란한 불교 문화, 후삼국 최종 통일",
        emoji: "🏰"
    },
    "조선시대": {
        bg: "from-red-500/10 to-rose-500/10 border-red-200 hover:border-red-400",
        text: "text-red-600",
        desc: "사대부의 나라, 500년 유교 역사와 세종대왕의 한글 창제",
        emoji: "📜"
    },
    "근현대": {
        bg: "from-teal-500/10 to-cyan-500/10 border-teal-200 hover:border-teal-400",
        text: "text-teal-600",
        desc: "일제강점기 3·1 운동의 외침과 대한민국 임시정부의 탄생",
        emoji: "🇰🇷"
    }
};

export default function CartoonPage() {
    const [episodes, setEpisodes] = useState<CartoonEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("고려시대"); // 기본 선택은 고려시대 (사용자 요청 예시가 고려이므로)

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const response = await apiRequest<{ data: CartoonEpisode[] }>("/api/cartoons");
                setEpisodes(response.data);
                setLoading(false);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "데이터를 불러오는 중 오류가 발생했습니다.";
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, []);

    // 고유 시대 목록 추출 (시대 정렬 순서 유지)
    const periods = Array.from(new Set(episodes.map(ep => ep.period)))
        .sort((a, b) => {
            const orderA = episodes.find(ep => ep.period === a)?.periodOrder || 0;
            const orderB = episodes.find(ep => ep.period === b)?.periodOrder || 0;
            return orderA - orderB;
        });

    // 선택된 시대의 에피소드 필터링 및 사건 순 정렬 (order 오름차순)
    const filteredEpisodes = episodes
        .filter(ep => ep.period === selectedPeriod)
        .sort((a, b) => a.order - b.order);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-toss-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-toss-gray600 text-lg font-semibold animate-pulse">역사 만화책을 펼치는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-toss-gray900 mb-2">데이터 로드 실패</h3>
                <p className="text-toss-gray600 mb-6">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2.5 rounded-xl bg-toss-blue text-white hover:bg-toss-blueHover font-bold shadow-sm transition-all"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="py-6 animate-fadeIn">
            {/* 상단 배너 헤더 */}
            <div className="relative overflow-hidden bg-gradient-to-tr from-toss-blue/5 via-indigo-500/5 to-purple-500/5 rounded-3xl p-8 md:p-12 mb-10 border border-toss-gray200/50 shadow-sm">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-toss-blue/10 text-toss-blue text-xs font-bold mb-4">
                        💡 신규 서비스 오픈
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-toss-gray900 leading-tight mb-4 tracking-tight">
                        만화로 보는 역사 📚
                    </h1>
                    <p className="text-toss-gray600 md:text-lg leading-relaxed font-medium">
                        어렵고 복잡했던 우리 역사를 재치 넘치는 2D 만화와 말풍선 대화로 한눈에 쏙쏙! 처음 한국사를 공부하는 분들도 부담 없이 흥미롭게 몰입해 보세요.
                    </p>
                </div>
                {/* 우측 장식 그래픽 */}
                <div className="absolute right-0 bottom-0 opacity-10 md:opacity-20 translate-x-12 translate-y-12 w-80 h-80 bg-toss-blue rounded-full filter blur-3xl pointer-events-none" />
            </div>

            {/* 시대별 썸네일 카드 그리드 */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-toss-gray900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🌍</span> 보고 싶은 역사의 시대를 선택하세요
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {periods.map((period) => {
                        const meta = PERIOD_METADATA[period] || { bg: "bg-toss-gray100/80 border-toss-gray200", text: "text-toss-gray800", desc: "주요 역사 에피소드", emoji: "📖" };
                        const isSelected = selectedPeriod === period;
                        const epForThumb = episodes.find(ep => ep.period === period);

                        return (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`flex flex-col text-left rounded-2xl border p-5 transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${meta.bg} ${
                                    isSelected 
                                        ? "ring-2 ring-toss-blue scale-[1.02] shadow-md border-transparent bg-white" 
                                        : "hover:shadow-sm"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4 w-full">
                                    <span className="text-2xl">{meta.emoji}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-toss-blue text-white" : "bg-toss-gray200 text-toss-gray700"}`}>
                                        {episodes.filter(ep => ep.period === period).length}개 에피소드
                                    </span>
                                </div>
                                <h3 className={`text-lg font-bold mb-1.5 ${meta.text}`}>
                                    {period}
                                </h3>
                                <p className="text-toss-gray500 text-xs font-medium leading-relaxed mb-4 flex-grow">
                                    {meta.desc}
                                </p>
                                {/* 썸네일 미리보기 */}
                                <div className="w-full h-32 rounded-xl overflow-hidden relative border border-toss-gray200/40 bg-toss-gray50">
                                    {epForThumb?.thumbnail ? (
                                        <img 
                                            src={epForThumb.thumbnail} 
                                            alt={period} 
                                            className="w-full h-full object-cover filter brightness-[0.95]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-toss-gray300">
                                            No Thumbnail
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent flex items-end p-3">
                                        <span className="text-white text-xs font-bold">대표 사건 보러가기 →</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 사건 리스트 (시간 발생 순 테이블) */}
            <div className="bg-white rounded-3xl border border-toss-gray200/80 shadow-sm p-6 md:p-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-toss-gray200/80 pb-5 mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-toss-gray900 flex items-center gap-2">
                            <span className="text-toss-blue">{selectedPeriod}</span> 연표 만화 목록 ⏰
                        </h2>
                        <p className="text-toss-gray500 text-sm mt-1 font-medium">
                            사건 발생 시간 순서대로 정렬되어 있어 역사 흐름을 한눈에 파악하기 좋습니다.
                        </p>
                    </div>
                    <span className="inline-flex self-start sm:self-auto items-center px-3 py-1 rounded-xl bg-toss-gray100 text-toss-gray800 text-xs font-bold">
                        총 {filteredEpisodes.length}개 사건
                    </span>
                </div>

                {filteredEpisodes.length === 0 ? (
                    <div className="text-center py-12 text-toss-gray500">
                        선택한 시대의 에피소드가 아직 등록되지 않았습니다.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-toss-gray200">
                                    <th className="py-4 px-4 text-toss-gray500 text-xs font-bold tracking-wider w-16 text-center">순서</th>
                                    <th className="py-4 px-4 text-toss-gray500 text-xs font-bold tracking-wider">주요 역사 사건 (타이틀)</th>
                                    <th className="py-4 px-4 text-toss-gray500 text-xs font-bold tracking-wider hidden md:table-cell">사건 요약 및 시놉시스</th>
                                    <th className="py-4 px-4 text-toss-gray500 text-xs font-bold tracking-wider text-center w-24">읽기</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEpisodes.map((ep, index) => (
                                    <tr 
                                        key={ep.id}
                                        className="group border-b border-toss-gray100 hover:bg-toss-gray50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="py-5 px-4 font-bold text-toss-gray400 group-hover:text-toss-blue transition-colors text-center text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="py-5 px-4">
                                            <Link href={`/cartoon/${ep.id}`} className="block">
                                                <span className="font-extrabold text-toss-gray900 group-hover:text-toss-blue transition-colors text-[15px] md:text-[16px] block">
                                                    {ep.title}
                                                </span>
                                                <span className="text-xs text-toss-gray400 mt-1 font-semibold inline-block md:hidden">
                                                    {ep.description}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="py-5 px-4 hidden md:table-cell">
                                            <span className="text-toss-gray600 text-sm font-medium line-clamp-1">
                                                {ep.description}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <Link 
                                                href={`/cartoon/${ep.id}`}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-toss-gray100 group-hover:bg-toss-blue group-hover:text-white text-toss-gray600 transition-all shadow-sm"
                                            >
                                                <span className="font-bold text-sm">📖</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
