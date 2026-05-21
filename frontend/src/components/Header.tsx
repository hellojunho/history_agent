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
        <header className="border-b px-4 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
            <h1 className="text-xl font-bold text-blue-600">
                <Link href="/">한국사능력검정시험</Link>
            </h1>
            <nav className="space-x-4 flex items-center">
                {isAdmin && (
                    <Link href="/admin" className="text-red-500 font-bold hover:text-red-700">관리자</Link>
                )}
                <Link href="/education" className="hover:text-blue-500">교육자료</Link>
                <Link href="/materials" className="hover:text-blue-500">학습자료</Link>
                <Link href="/cbt" className="hover:text-blue-500">CBT 기출문제</Link>
                <Link href="/schedules" className="hover:text-blue-500">시험 일정</Link>
                {isLoggedIn && (
                    <Link href="/mypage" className="hover:text-blue-500">마이페이지</Link>
                )}
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">
                        로그아웃
                    </button>
                ) : (
                    <Link href="/auth/login" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                        로그인
                    </Link>
                )}
            </nav>
        </header>
    );
}
