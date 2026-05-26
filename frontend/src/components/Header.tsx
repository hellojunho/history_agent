"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, GraduationCap, LayoutDashboard, LogOut, Menu, PenSquare, Sparkles, UserCircle2, X } from "lucide-react";

const NAV_ITEMS = [
    { href: "/education", label: "학습자료", icon: BookOpen },
    { href: "/cbt", label: "CBT", icon: GraduationCap },
    { href: "/cram", label: "벼락치기", icon: Sparkles },
    { href: "/schedules", label: "시험 일정", icon: CalendarDays },
    { href: "/inquiries", label: "문의", icon: PenSquare },
];

export default function Header() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setIsAdmin(false);
            setIsLoggedIn(false);
            return;
        }

        setIsLoggedIn(true);
        try {
            const payloadStr = token.split(".")[1];
            if (!payloadStr) return;

            const base64Url = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
            const base64 = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
            const decodedPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            const payload = JSON.parse(decodedPayload);
            setIsAdmin(payload.role === "admin");
        } catch (error) {
            console.error("Failed to parse token", error);
        }
    }, [pathname]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsMenuOpen(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 px-3 py-3 sm:px-4">
            <div className="page-container">
                <div className="glass-panel animated-border px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-4">
                        <Link href="/" className="group flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-sm font-black text-white shadow-lg shadow-blue-500/25">
                                ㅎㄴㄱ
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[15px] font-black tracking-[-0.03em] text-slate-950">한능검 학습 스튜디오</p>
                                <p className="truncate text-xs font-semibold text-slate-500">이해, 암기, 복습을 한 흐름으로 묶은 한국사 학습 서비스</p>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-1 lg:flex">
                            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                : "text-slate-600 hover:bg-white hover:text-slate-950"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="hidden items-center gap-2 lg:flex">
                            {isAdmin && (
                                <Link href="/admin" className="app-button-secondary px-4 py-2.5 text-xs">
                                    <LayoutDashboard className="h-4 w-4" />
                                    관리자
                                </Link>
                            )}
                            {isLoggedIn && (
                                <Link href="/mypage" className="app-button-secondary px-4 py-2.5 text-xs">
                                    <UserCircle2 className="h-4 w-4" />
                                    마이페이지
                                </Link>
                            )}
                            {isLoggedIn ? (
                                <button onClick={handleLogout} className="app-button-secondary px-4 py-2.5 text-xs">
                                    <LogOut className="h-4 w-4" />
                                    로그아웃
                                </button>
                            ) : (
                                <Link href="/auth/login" className="app-button-primary px-4 py-2.5 text-xs">
                                    학습 시작
                                </Link>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 transition hover:bg-white lg:hidden"
                            aria-label="메뉴 열기"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="mt-4 space-y-4 border-t border-slate-200/70 pt-4 lg:hidden">
                            <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                                    const isActive = pathname === href || pathname.startsWith(`${href}/`);

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                                isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white/70 text-slate-700 hover:bg-white"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {isAdmin && (
                                    <Link href="/admin" className="app-button-secondary">
                                        <LayoutDashboard className="h-4 w-4" />
                                        관리자
                                    </Link>
                                )}
                                {isLoggedIn && (
                                    <Link href="/mypage" className="app-button-secondary">
                                        <UserCircle2 className="h-4 w-4" />
                                        마이페이지
                                    </Link>
                                )}
                                {isLoggedIn ? (
                                    <button onClick={handleLogout} className="app-button-secondary">
                                        <LogOut className="h-4 w-4" />
                                        로그아웃
                                    </button>
                                ) : (
                                    <Link href="/auth/login" className="app-button-primary">
                                        학습 시작
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
