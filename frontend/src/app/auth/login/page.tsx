"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function LoginPage(): JSX.Element | null {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("autoLogin") === "admin") {
                const triggerAutoLogin = async () => {
                    setError("");
                    try {
                        const data = await apiRequest<{ accessToken: string; user: { role: string } }>("/api/auth/login", {
                            method: "POST",
                            body: JSON.stringify({ email: "admin@admin.com", password: "admin" }),
                        });
                        localStorage.setItem("accessToken", data.accessToken);
                        window.location.href = data.user?.role === "admin" ? "/" : "/education";
                    } catch (err: any) {
                        setError(err.message || "자동 로그인에 실패했습니다.");
                        setIsChecking(false);
                    }
                };
                triggerAutoLogin();
                return;
            }
        }

        const token = localStorage.getItem("accessToken");
        if (token) {
            router.replace("/");
        } else {
            setIsChecking(false);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const data = await apiRequest<{ accessToken: string; user: { role: string } }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            localStorage.setItem("accessToken", data.accessToken);
            if (data.user?.role === "admin") {
                window.location.href = "/";
            } else {
                window.location.href = "/education";
            }
        } catch (err: any) {
            setError(err.message || "로그인에 실패했습니다.");
        }
    };

    if (isChecking) return null;

    return (
        <div className="page-container pt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
                <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:px-8 sm:py-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.35),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(251,191,36,0.22),transparent_20%),linear-gradient(135deg,#0f172a_0%,#172554_52%,#1e3a8a_100%)]" />
                    <div className="relative space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Login Experience
                        </span>
                        <div className="space-y-3">
                            <h1 className="headline-balance text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                                학습 흐름을
                                <br />
                                이어서 시작하세요
                            </h1>
                            <p className="max-w-xl text-sm leading-7 text-blue-50/78 sm:text-base">
                                로그인 후에는 시대별 학습, 요약 퀴즈, CBT 풀이와 오답 관리까지 한 흐름으로 이어집니다.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-100/70">Study</p>
                                <p className="mt-2 text-sm font-black">시대별 학습 자료</p>
                            </div>
                            <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-100/70">Review</p>
                                <p className="mt-2 text-sm font-black">요약 + 퀴즈</p>
                            </div>
                            <div className="rounded-3xl border border-white/12 bg-white/10 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-100/70">Practice</p>
                                <p className="mt-2 text-sm font-black">CBT 실전 점검</p>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/12 bg-white/10 p-5">
                            <div className="flex items-center gap-2 text-sm font-black">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                로그인 후 바로 이어지는 추천 순서
                            </div>
                            <p className="mt-3 text-sm leading-7 text-blue-50/76">
                                학습자료에서 한 시대를 읽고, 요약 퀴즈로 기억을 굳힌 뒤, CBT에서 실제 시험 선지 감각까지 마무리합니다.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="glass-panel animated-border p-6 sm:p-8">
                    <div className="mb-6">
                        <span className="section-label">Sign In</span>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">로그인</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">학습 기록과 개인화된 복습 흐름을 이어서 사용합니다.</p>
                    </div>

                    {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">이메일</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" 
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">비밀번호</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" 
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="app-button-primary w-full py-3.5 text-base"
                        >
                            로그인하고 학습 이어가기
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        계정이 없으신가요?{" "}
                        <Link href="/auth/register" className="font-black text-blue-700 hover:text-blue-800">
                            회원가입
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
}
