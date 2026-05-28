"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface CharacterDialogue {
    name: string;
    text: string;
}

interface CartoonCut {
    id: number;
    cutOrder: number;
    imageUrl: string;
    narration: string;
    dialogue: {
        characters: CharacterDialogue[];
    } | null;
}

interface CartoonEpisode {
    id: number;
    period: string;
    periodOrder: number;
    title: string;
    description: string;
    thumbnail: string;
    order: number;
    cuts: CartoonCut[];
}

export default function CartoonDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const episodeId = params.id;

    const [episode, setEpisode] = useState<CartoonEpisode | null>(null);
    const [allEpisodes, setAllEpisodes] = useState<CartoonEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 감상 모드: "webtoon" (세로 스크롤) | "slide" (한 컷씩 슬라이드)
    const [viewMode, setViewMode] = useState<"webtoon" | "slide">("webtoon");
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. 에피소드 상세 페칭
                const detailResponse = await apiRequest<{ data: CartoonEpisode }>(`/api/cartoons/${episodeId}`);
                setEpisode(detailResponse.data);

                // 2. 전체 목록 페칭 (이전/다음 네비게이션용)
                const listResponse = await apiRequest<{ data: CartoonEpisode[] }>("/api/cartoons");
                setAllEpisodes(listResponse.data);

                setLoading(false);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "만화를 불러오는 데 실패했습니다.";
                setError(errorMessage);
                setLoading(false);
            }
        };

        if (episodeId) {
            fetchData();
        }
    }, [episodeId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 border-4 border-toss-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-toss-gray600 text-lg font-semibold animate-pulse">만화 컷들을 불러오고 있습니다...</p>
            </div>
        );
    }

    if (error || !episode) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                <div className="text-5xl mb-4">😿</div>
                <h3 className="text-xl font-bold text-toss-gray900 mb-2 font-black">만화를 찾을 수 없습니다</h3>
                <p className="text-toss-gray600 mb-6">{error || "해당 만화의 상세 정보가 존재하지 않습니다."}</p>
                <Link 
                    href="/cartoon" 
                    className="px-6 py-2.5 rounded-xl bg-toss-blue text-white hover:bg-toss-blueHover font-bold shadow-sm transition-all text-sm"
                >
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    // 이전/다음 에피소드 연산
    const currentIdx = allEpisodes.findIndex(ep => ep.id === episode.id);
    const prevEpisode = currentIdx > 0 ? allEpisodes[currentIdx - 1] : null;
    const nextEpisode = currentIdx < allEpisodes.length - 1 ? allEpisodes[currentIdx + 1] : null;

    // 만화 이미지 위 오버레이 말풍선 좌표 및 스타일 수식
    const getOverlayBubbleStyle = (name: string, index: number) => {
        // 코믹북 만화 스타일 기본: 두꺼운 검은 테두리(border-2 border-black), 뚜렷한 하드 섀도우, 겹치지 않는 컴팩트한 글꼴 크기
        const base = "absolute max-w-[130px] sm:max-w-[160px] p-2.5 pt-3.5 rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-[10px] sm:text-xs font-black text-toss-gray950 transition-all duration-200 hover:scale-[1.02] z-20 animate-fadeIn";
        
        if (index === 0) {
            // 첫 번째 대화: 좌측 상단 배치, 산뜻한 화이트
            return {
                classes: `${base} left-2 top-6 bg-white text-black`,
                badge: "bg-[#3182F6] text-white", 
                tailOuter: "absolute -left-[10px] top-3.5 w-0 h-0 border-[6px] border-transparent border-r-black",
                tailInner: "absolute -left-[7px] top-[15.5px] w-0 h-0 border-[4.5px] border-transparent border-r-white"
            };
        } else if (index === 1) {
            // 두 번째 대화: 우측 하단 배치, 경쾌한 옐로우
            return {
                classes: `${base} right-2 bottom-6 bg-[#FFF89A] text-black`,
                badge: "bg-[#FF5F2E] text-white", 
                tailOuter: "absolute -right-[10px] bottom-3.5 w-0 h-0 border-[6px] border-transparent border-l-black",
                tailInner: "absolute -right-[7px] bottom-[15.5px] w-0 h-0 border-[4.5px] border-transparent border-l-[#FFF89A]"
            };
        } else if (index === 2) {
            // 세 번째 대화: 좌측 하단 배치, 부드러운 스카이블루
            return {
                classes: `${base} left-2 bottom-6 bg-[#E8F3FF] text-black`,
                badge: "bg-[#1A6DFF] text-white",
                tailOuter: "absolute -left-[10px] bottom-3.5 w-0 h-0 border-[6px] border-transparent border-r-black",
                tailInner: "absolute -left-[7px] bottom-[15.5px] w-0 h-0 border-[4.5px] border-transparent border-r-[#E8F3FF]"
            };
        } else {
            // 네 번째 대화: 우측 상단 배치, 발랄한 핑크
            return {
                classes: `${base} right-2 top-6 bg-[#FFEBF0] text-black`,
                badge: "bg-[#FF2E93] text-white",
                tailOuter: "absolute -right-[10px] top-3.5 w-0 h-0 border-[6px] border-transparent border-l-black",
                tailInner: "absolute -right-[7px] top-[15.5px] w-0 h-0 border-[4.5px] border-transparent border-l-[#FFEBF0]"
            };
        }
    };



    return (
        <div className="py-6 max-w-4xl mx-auto animate-fadeIn">
            {/* 상단 탭/목록 네비게이션 */}
            <div className="flex items-center justify-between mb-6">
                <Link 
                    href="/cartoon" 
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-toss-gray100 hover:bg-toss-gray200 text-toss-gray700 font-bold transition-all text-sm shadow-sm"
                >
                    <span>←</span> 목록으로
                </Link>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-toss-gray100 p-1 rounded-2xl border border-toss-gray200/50 shadow-inner">
                        <button
                            onClick={() => setViewMode("webtoon")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === "webtoon" 
                                    ? "bg-white text-toss-blue shadow-sm" 
                                    : "text-toss-gray500 hover:text-toss-gray800"
                            }`}
                        >
                            ↕️ 웹툰 스크롤
                        </button>
                        <button
                            onClick={() => {
                                setViewMode("slide");
                                setCurrentSlideIndex(0);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === "slide" 
                                    ? "bg-white text-toss-blue shadow-sm" 
                                    : "text-toss-gray500 hover:text-toss-gray800"
                            }`}
                        >
                            ↔️ 슬라이드 쇼
                        </button>
                    </div>
                </div>
            </div>

            {/* 에피소드 메타 타이틀 */}
            <div className="bg-white rounded-3xl border border-toss-gray200/80 p-6 md:p-8 mb-8 text-center shadow-sm">
                <span className="inline-block px-3 py-1 rounded-full bg-toss-blue/10 text-toss-blue text-xs font-bold mb-3">
                    {episode.period} • {episode.order}회차
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-toss-gray900 tracking-tight leading-snug">
                    {episode.title}
                </h1>
                <p className="text-toss-gray500 text-sm md:text-[15px] font-semibold mt-3 max-w-2xl mx-auto leading-relaxed">
                    {episode.description}
                </p>
            </div>

            {/* 메인 뷰어 공간 */}
            {viewMode === "webtoon" ? (
                /* 1. 웹툰형 세로 뷰 */
                <div className="flex flex-col gap-12 bg-toss-gray50/50 rounded-3xl border border-toss-gray200/40 p-4 sm:p-8 mb-10 shadow-inner">
                    {episode.cuts.map((cut) => (
                        <div 
                            key={cut.id}
                            className="bg-white rounded-2xl border border-toss-gray200/70 p-5 md:p-7 shadow-sm transition-all duration-300 hover:shadow-md max-w-2xl mx-auto w-full"
                        >
                            {/* 나레이션 박스 */}
                            {cut.narration && (
                                <div className="mb-5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-toss-gray800 text-sm md:text-[15px] font-bold shadow-inner leading-relaxed flex items-start gap-2">
                                    <span className="text-amber-500 text-lg">💡</span>
                                    <span>{cut.narration}</span>
                                </div>
                            )}

                            {/* 만화 컷 이미지 컨테이너 (relative로 배치) */}
                            <div className="rounded-xl overflow-hidden relative border-4 border-toss-gray900 aspect-square w-full mb-6 shadow-md hover:scale-[1.01] transition-transform bg-toss-gray50">
                                <img 
                                    src={cut.imageUrl} 
                                    alt={`컷 ${cut.cutOrder}`} 
                                    className="w-full h-full object-cover filter brightness-[0.98]"
                                />

                                {/* 이미지 내부 오버레이 말풍선 (겹침 방지 컴팩트 배치) */}
                                {cut.dialogue && cut.dialogue.characters && cut.dialogue.characters.map((char, charIdx) => {
                                    const bstyle = getOverlayBubbleStyle(char.name, charIdx);
                                    return (
                                        <div 
                                            key={charIdx} 
                                            className={bstyle.classes}
                                            style={{ wordBreak: "keep-all" }}
                                        >
                                            {/* 풍선 꼬리 테두리 (Outer) */}
                                            <div className={bstyle.tailOuter} />
                                            {/* 풍선 꼬리 내부색 (Inner) */}
                                            <div className={bstyle.tailInner} />
                                            
                                            {/* 캐릭터 네임 뱃지 (말풍선 상단 보더에 반쯤 걸치는 프리미엄 디자인) */}
                                            <span className={`absolute -top-3.5 left-4 inline-block text-[10px] font-black px-2.5 py-0.5 rounded-md border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-30 select-none ${bstyle.badge}`}>
                                                {char.name}
                                            </span>

                                            {/* 대사 본문 */}
                                            <p className="leading-snug tracking-tight font-black pt-1">{char.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* 2. 슬라이드 쇼 한 컷 보기 뷰 */
                <div className="bg-white rounded-3xl border border-toss-gray200/80 p-6 md:p-10 mb-10 shadow-sm max-w-2xl mx-auto w-full relative">
                    {/* 상단 진행 바 */}
                    <div className="w-full bg-toss-gray100 h-2 rounded-full overflow-hidden mb-6 flex">
                        {episode.cuts.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-full flex-grow border-r border-white/50 transition-all ${
                                    idx <= currentSlideIndex ? "bg-toss-blue" : "bg-toss-gray200"
                                }`}
                            />
                        ))}
                    </div>

                    {/* 액티브 컷 */}
                    {(() => {
                        const cut = episode.cuts[currentSlideIndex];
                        if (!cut) return null;
                        return (
                            <div className="animate-fadeIn">
                                {/* 나레이션 */}
                                {cut.narration && (
                                    <div className="mb-5 bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-toss-gray800 text-sm md:text-[15px] font-bold leading-relaxed flex items-start gap-2">
                                        <span className="text-amber-500 text-lg">💡</span>
                                        <span>{cut.narration}</span>
                                    </div>
                                )}

                                {/* 이미지 컨테이너 (relative로 배치) */}
                                <div className="rounded-xl overflow-hidden relative border-4 border-toss-gray900 aspect-square w-full mb-6 shadow-md bg-toss-gray50">
                                    <img 
                                        src={cut.imageUrl} 
                                        alt={`컷 ${cut.cutOrder}`} 
                                        className="w-full h-full object-cover"
                                    />

                                    {/* 이미지 내부 오버레이 말풍선 */}
                                    {cut.dialogue && cut.dialogue.characters && cut.dialogue.characters.map((char, charIdx) => {
                                        const bstyle = getOverlayBubbleStyle(char.name, charIdx);
                                        return (
                                            <div 
                                                key={charIdx} 
                                                className={bstyle.classes}
                                                style={{ wordBreak: "keep-all" }}
                                            >
                                                {/* 풍선 꼬리 테두리 (Outer) */}
                                                <div className={bstyle.tailOuter} />
                                                {/* 풍선 꼬리 내부색 (Inner) */}
                                                <div className={bstyle.tailInner} />
                                                
                                                {/* 캐릭터 네임 뱃지 (말풍선 상단 보더에 반쯤 걸치는 프리미엄 디자인) */}
                                                <span className={`absolute -top-3.5 left-4 inline-block text-[10px] font-black px-2.5 py-0.5 rounded-md border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] z-30 select-none ${bstyle.badge}`}>
                                                    {char.name}
                                                </span>

                                                {/* 대사 본문 */}
                                                <p className="leading-snug tracking-tight font-black pt-1">{char.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* 슬라이드 이전/다음 트리거 */}
                    <div className="flex items-center justify-between mt-8 border-t border-toss-gray100 pt-6">
                        <button
                            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentSlideIndex === 0}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm ${
                                currentSlideIndex === 0 
                                    ? "bg-toss-gray100 text-toss-gray400 cursor-not-allowed" 
                                    : "bg-toss-gray200 hover:bg-toss-gray300 text-toss-gray800"
                            }`}
                        >
                            이전 컷
                        </button>
                        <span className="text-sm text-toss-gray500 font-bold">
                            {currentSlideIndex + 1} / {episode.cuts.length}
                        </span>
                        <button
                            onClick={() => {
                                if (currentSlideIndex === episode.cuts.length - 1) {
                                    // 마지막 슬라이드에서 다음 에피소드로 바로가기 제안
                                    if (nextEpisode) {
                                        router.push(`/cartoon/${nextEpisode.id}`);
                                    } else {
                                        alert("이 시대의 마지막 컷입니다! 🎉");
                                    }
                                } else {
                                    setCurrentSlideIndex(prev => prev + 1);
                                }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-toss-blue hover:bg-toss-blueHover text-white font-bold transition-all text-sm shadow-sm"
                        >
                            {currentSlideIndex === episode.cuts.length - 1 ? "다음 에피소드" : "다음 컷"}
                        </button>
                    </div>
                </div>
            )}

            {/* 하단 에피소드 네비게이션 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-toss-gray200/80 pt-8 mt-10">
                {prevEpisode ? (
                    <Link 
                        href={`/cartoon/${prevEpisode.id}`}
                        className="flex flex-col items-start gap-1 p-4 rounded-2xl border border-toss-gray200/60 bg-white hover:border-toss-blue hover:bg-toss-blue/5 transition-all text-left w-full sm:w-[48%] group"
                    >
                        <span className="text-xs font-bold text-toss-gray400 group-hover:text-toss-blue">← 이전 에피소드</span>
                        <span className="text-[14px] font-black text-toss-gray800 group-hover:text-toss-blue transition-colors line-clamp-1">{prevEpisode.title}</span>
                    </Link>
                ) : (
                    <div className="hidden sm:block w-[48%]" />
                )}

                {nextEpisode ? (
                    <Link 
                        href={`/cartoon/${nextEpisode.id}`}
                        className="flex flex-col items-end gap-1 p-4 rounded-2xl border border-toss-gray200/60 bg-white hover:border-toss-blue hover:bg-toss-blue/5 transition-all text-right w-full sm:w-[48%] group"
                    >
                        <span className="text-xs font-bold text-toss-gray400 group-hover:text-toss-blue">다음 에피소드 →</span>
                        <span className="text-[14px] font-black text-toss-gray800 group-hover:text-toss-blue transition-colors line-clamp-1">{nextEpisode.title}</span>
                    </Link>
                ) : (
                    <div className="hidden sm:block w-[48%]" />
                )}
            </div>
        </div>
    );
}
