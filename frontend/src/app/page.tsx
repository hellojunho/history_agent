import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, CalendarClock, CheckCircle2, FileStack, LayoutGrid, MessageSquareText, ShieldAlert, Sparkles, Target } from "lucide-react";

const serviceCards = [
    {
        href: "/education",
        title: "시대별 학습자료",
        description: "정치, 경제, 사회, 문화를 한 흐름으로 읽으며 시대 구조를 빠르게 이해합니다.",
        icon: BookOpen,
        tone: "from-blue-600/15 to-cyan-400/10 text-blue-700",
        cta: "기본기 다지기",
    },
    {
        href: "/cbt",
        title: "CBT 기출문제",
        description: "실전 화면과 유사한 풀이 흐름으로 약한 영역을 바로 발견하고 교정합니다.",
        icon: Target,
        tone: "from-emerald-500/15 to-lime-400/10 text-emerald-700",
        cta: "실전 감각 올리기",
    },
    {
        href: "/cram",
        title: "벼락치기 D-1",
        description: "시험 직전 필요한 핵심만 골라 30분 단위로 압축 복습할 수 있습니다.",
        icon: Sparkles,
        tone: "from-amber-500/20 to-orange-400/10 text-amber-700",
        cta: "초압축 복습",
    },
    {
        href: "/schedules",
        title: "시험 일정 관리",
        description: "접수일, 시험일, 발표일을 놓치지 않도록 일정을 한 번에 확인합니다.",
        icon: CalendarClock,
        tone: "from-violet-500/15 to-fuchsia-400/10 text-violet-700",
        cta: "일정 확인하기",
    },
];

const valuePoints = [
    "학습 자료와 문제 풀이가 분리되지 않아 이해한 내용을 바로 점검할 수 있습니다.",
    "핵심 요약과 퀴즈가 시대별 학습 흐름 안에 붙어 있어 복습 전환이 자연스럽습니다.",
    "모바일에서도 버튼 밀도와 정보 계층이 유지되도록 레이아웃을 재구성했습니다.",
];

const studySteps = [
    {
        title: "1. 흐름을 읽습니다",
        description: "시대별 자료에서 정치와 경제를 먼저 파악하고 사회·문화로 확장합니다.",
        icon: LayoutGrid,
    },
    {
        title: "2. 시험 언어로 바꿉니다",
        description: "핵심 요약본과 퀴즈로 출제 포인트를 선지 단위까지 압축합니다.",
        icon: Brain,
    },
    {
        title: "3. 실전으로 검증합니다",
        description: "CBT와 오답 정리로 시간 배분, 정답률, 헷갈리는 개념을 마무리합니다.",
        icon: FileStack,
    },
];

export default function Page(): JSX.Element {
    return (
        <div className="space-y-10 pb-16 pt-4 sm:space-y-12 sm:pt-6">
            <section className="page-container">
                <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_36px_90px_rgba(15,23,42,0.28)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.34),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(250,204,21,0.22),transparent_20%),linear-gradient(135deg,#0f172a_0%,#172554_54%,#1e3a8a_100%)]" />
                    <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-amber-300/20 blur-3xl" />

                    <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_360px] lg:items-end">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-100">
                                <Sparkles className="h-3.5 w-3.5" />
                                한국사 학습 UX 개편
                            </span>
                            <div className="space-y-4">
                                <h1 className="headline-balance max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                                    이해에서 복습까지 끊기지 않는
                                    <br />
                                    한국사 학습 플로우
                                </h1>
                                <p className="max-w-2xl text-sm font-medium leading-7 text-blue-50/82 sm:text-base">
                                    단순히 자료를 모아두는 서비스가 아니라, 시대 흐름을 읽고 바로 확인 문제로 전환하는 학습 동선을 중심으로 UI를 다시 설계했습니다.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href="/education" className="app-button-primary bg-white px-6 py-3.5 text-sm text-white sm:text-base">
                                    학습 시작하기
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/cbt" className="app-button-secondary border-white/10 bg-white/10 px-6 py-3.5 text-sm text-white hover:bg-white/18 sm:text-base">
                                    CBT 바로 풀기
                                </Link>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100/72">Learning Flow</p>
                                    <p className="mt-3 text-2xl font-black">3 Step</p>
                                    <p className="mt-1 text-sm text-blue-50/72">이해 → 점검 → 실전</p>
                                </div>
                                <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100/72">Study Assets</p>
                                    <p className="mt-3 text-2xl font-black">9 Eras</p>
                                    <p className="mt-1 text-sm text-blue-50/72">시대별 학습 자료 구조화</p>
                                </div>
                                <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100/72">Exam Ready</p>
                                    <p className="mt-3 text-2xl font-black">CBT + 요약</p>
                                    <p className="mt-1 text-sm text-blue-50/72">출제 포인트 중심 복습</p>
                                </div>
                            </div>
                        </div>

                        <div className="soft-panel space-y-4 p-5 text-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Recommended Journey</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">오늘의 학습 루트</h2>
                                </div>
                                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                                    <Brain className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {studySteps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.title} className="rounded-3xl border border-slate-200/80 bg-white p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-2xl bg-slate-950 p-2.5 text-white">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-black text-slate-950">{step.title}</h3>
                                                    <p className="text-sm leading-6 text-slate-600">{step.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="page-container grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="glass-panel animated-border p-6 sm:p-8">
                    <span className="section-label">Why This UX Works</span>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {valuePoints.map((point, index) => (
                            <div key={point} className="metric-card">
                                <span className="text-sm font-black text-blue-700">0{index + 1}</span>
                                <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="soft-panel p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">시험 함정 체크</p>
                            <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-slate-950">오개념 주의</h3>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                        고려의 삼사는 회계 기구, 조선의 삼사는 언론 기구입니다. 이런 헷갈리는 선지는 요약 모달과 퀴즈에서 반복 노출되도록 배치했습니다.
                    </p>
                    <Link href="/education/04_goryeo" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                        고려 시대 핵심 정리 보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            <section className="page-container space-y-5">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <span className="section-label">Core Services</span>
                        <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">학습 흐름에 맞춘 핵심 기능</h2>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {serviceCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className={`group overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br ${card.tone} p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]`}
                            >
                                <div className="flex h-full flex-col justify-between gap-8">
                                    <div className="space-y-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">{card.title}</h3>
                                            <p className="text-sm leading-7 text-slate-700">{card.description}</p>
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center gap-2 text-sm font-black text-slate-950">
                                        {card.cta}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="page-container grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="glass-panel p-6 sm:p-8">
                    <span className="section-label">Study Path</span>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">처음 들어와도 길을 잃지 않게 구성했습니다</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {studySteps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.title} className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-black tracking-[-0.03em] text-slate-950">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="soft-panel space-y-4 p-6">
                    <span className="section-label bg-emerald-100 text-emerald-800">Support</span>
                    <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">학습 중 막히면 바로 해결</h2>
                    <p className="text-sm leading-7 text-slate-600">
                        질문 게시판과 일정 안내를 함께 두어, 자료를 보고 끝나는 경험이 아니라 실제 학습 운영까지 이어지게 했습니다.
                    </p>
                    <div className="grid gap-3">
                        <Link href="/inquiries" className="rounded-3xl border border-slate-200/80 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40">
                            <div className="flex items-center gap-3">
                                <MessageSquareText className="h-5 w-5 text-blue-700" />
                                <div>
                                    <p className="text-sm font-black text-slate-950">문의 게시판</p>
                                    <p className="text-sm text-slate-600">학습 중 막힌 개념이나 서비스 관련 이슈를 남길 수 있습니다.</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/materials" className="rounded-3xl border border-slate-200/80 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40">
                            <div className="flex items-center gap-3">
                                <FileStack className="h-5 w-5 text-blue-700" />
                                <div>
                                    <p className="text-sm font-black text-slate-950">추가 학습 자료</p>
                                    <p className="text-sm text-slate-600">공식 자료와 요약본을 빠르게 탐색할 수 있습니다.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                            <p className="text-sm font-black">추천 시작 순서</p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            학습자료 → 시대 요약/퀴즈 → CBT → 오답 노트 순서로 사용하면 서비스 간 이동 비용이 가장 낮습니다.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
