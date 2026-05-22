import React from "react";
import Link from "next/link";
import { BookOpen, Award, Calendar, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export default function Page(): JSX.Element {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-toss-blue to-blue-600 rounded-toss p-8 md:p-12 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 scale-150 transition-transform group-hover:scale-125 duration-500">
                    <Sparkles className="w-96 h-96" />
                </div>
                <div className="relative z-10 space-y-4 max-w-lg">
                    <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        한능검 단기 완성 솔루션
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                        ㅎㄴㄱ 스타일로<br />
                        더 쉽고 빠르게 끝내는 한국사
                    </h2>
                    <p className="text-white/80 text-sm md:text-base font-medium">
                        스토리 중심의 시대별 교재 학습부터 빈출 요약 모달, 실전 CBT 기출문제 풀이까지 모든 학습을 한 번에 해결해 보세요.
                    </p>
                    <div className="pt-2">
                        <Link href="/education" className="inline-flex items-center gap-2 bg-white text-toss-blue font-bold px-6 py-3 rounded-xl hover:bg-toss-gray100 active:scale-95 transition-all shadow-md text-sm">
                            무료로 학습 시작하기
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Menu Cards */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-toss-gray800 px-1">추천 서비스</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <Link href="/education" className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-toss-blue group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-lg text-toss-gray900">시대별 학습자료</h4>
                                <p className="text-toss-gray600 text-xs leading-relaxed">
                                    흐름을 잡아야 한능검 1급을 받습니다. 체계적이고 직관적인 마크다운 서술형 학습 제공.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-1 text-toss-blue font-bold text-xs">
                            공부하러 가기
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 2 */}
                    <Link href="/cbt" className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-lg text-toss-gray900">CBT 기출문제</h4>
                                <p className="text-toss-gray600 text-xs leading-relaxed">
                                    최신 한능검 기출문제를 실전처럼 풀고 해설을 확인하세요. 오답노트를 통한 밀착 관리.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-1 text-indigo-500 font-bold text-xs">
                            기출 풀러 가기
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 3 (Cram) */}
                    <Link href="/cram" className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-lg text-toss-gray900">벼락치기 (D-1)</h4>
                                <p className="text-toss-gray600 text-xs leading-relaxed">
                                    시험 하루 전 초고효율 정리! 시대 핵심 다이어그램과 20문항의 엄선 퀴즈로 빠르게 극대화하세요.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-1 text-rose-500 font-bold text-xs">
                            초고효율 공부하기
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Card 4 */}
                    <Link href="/schedules" className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-lg text-toss-gray900">시험 일정 안내</h4>
                                <p className="text-toss-gray600 text-xs leading-relaxed">
                                    국사편찬위원회 공식 시험 일정을 반영하여, 원서접수일과 시험일을 간편하게 알립니다.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-1 text-amber-500 font-bold text-xs">
                            일정 확인하기
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-toss-gray900 text-sm">출제 포인트 및 오개념 주의</h4>
                        <p className="text-toss-gray600 text-xs leading-normal">
                            고려의 삼사(회계 기구)는 조선의 삼사(언론 기구)와 다릅니다. 이와 같은 핵심 함정 지문을 학습자료에서 확인하세요.
                        </p>
                    </div>
                </div>
                <Link href="/education/04_goryeo" className="flex-shrink-0 bg-toss-gray100 text-toss-gray800 hover:bg-toss-gray200 font-bold px-4 py-2.5 rounded-xl transition-all text-xs active:scale-95">
                    고려 시대 보러가기
                </Link>
            </div>
        </div>
    );
}
