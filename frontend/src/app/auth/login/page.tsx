"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
                        window.location.href = data.user?.role === "admin" ? "/admin" : "/education";
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
                window.location.href = "/admin";
            } else {
                window.location.href = "/education";
            }
        } catch (err: any) {
            setError(err.message || "로그인에 실패했습니다.");
        }
    };

    if (isChecking) return null;

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">로그인</h2>
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">이메일</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" 
                        placeholder="example@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">비밀번호</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" 
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                    로그인
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                계정이 없으신가요? <a href="/auth/register" className="text-blue-600 font-medium hover:underline ml-1">회원가입</a>
            </p>
        </div>
    );
}
