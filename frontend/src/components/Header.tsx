"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setIsLoggedIn(true);
            try {
                // Decode JWT to check role
                const payloadStr = token.split(".")[1];
                if (payloadStr) {
                    const base64Url = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
                    const base64 = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
                    const decodedPayload = decodeURIComponent(
                        atob(base64)
                            .split("")
                            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                            .join("")
                    );
                    const payload = JSON.parse(decodedPayload);
                    if (payload.role === "admin") {
                        setIsAdmin(true);
                    }
                }
            } catch (e) {
                console.error("Failed to parse token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
        setIsAdmin(false);
        router.push("/");
    };

    return (
        <header className="border-b border-toss-gray200/80 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
            <h1 className="text-xl font-bold text-toss-blue tracking-tight hover:opacity-80 transition-opacity">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <span className="inline-flex items-center justify-center bg-toss-blue text-white font-black text-[10px] px-2 h-7 rounded-xl shadow-sm transition-transform group-hover:scale-105 active:scale-95 leading-none">
                        ㅎㄴㄱ
                    </span>
                    <span className="font-extrabold text-toss-gray900 text-lg tracking-tight group-hover:text-toss-blue transition-colors">ㅎㄴㄱ</span>
                </Link>
            </h1>
            <nav className="flex items-center gap-2">
                {isAdmin && (
                    <Link href="/admin" className="text-red-500 font-bold hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all text-sm">관리자</Link>
                )}
                <Link href="/education" className="text-toss-gray600 hover:text-toss-gray900 hover:bg-toss-gray100/60 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold">교육자료</Link>
                <Link href="/cbt" className="text-toss-gray600 hover:text-toss-gray900 hover:bg-toss-gray100/60 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold">CBT 기출문제</Link>
                <Link href="/cram" className="text-toss-gray600 hover:text-toss-gray900 hover:bg-toss-gray100/60 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold">벼락치기(D-1)</Link>
                <Link href="/schedules" className="text-toss-gray600 hover:text-toss-gray900 hover:bg-toss-gray100/60 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold">시험 일정</Link>
                {isLoggedIn && (
                    <Link href="/mypage" className="text-toss-gray600 hover:text-toss-gray900 hover:bg-toss-gray100/60 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold">마이페이지</Link>
                )}
                <div className="border-l border-toss-gray200 h-4 mx-2" />
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-toss-gray200 text-toss-gray800 hover:bg-toss-gray300 text-xs font-bold transition-all">
                        로그아웃
                    </button>
                ) : (
                    <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-toss-blue text-white hover:bg-toss-blueHover text-xs font-bold transition-all shadow-sm">
                        로그인
                    </Link>
                )}
            </nav>
        </header>
    );
}
