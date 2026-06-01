"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function RegisterPage(): JSX.Element | null {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hanneunggeomId, setHanneunggeomId] = useState("");
    const [hanneunggeomPassword, setHanneunggeomPassword] = useState("");
    const [error, setError] = useState("");
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
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

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await apiRequest("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, hanneunggeomId, hanneunggeomPassword }),
            });
            // 가입 후 자동 로그인 시도
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
            setError(err.message || "회원가입에 실패했습니다.");
        }
    };

    if (isChecking) return null;

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">회원가입</h2>
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">이메일</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                        placeholder="example@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">한능검 공식 사이트 ID</label>
                    <input 
                        type="text" 
                        value={hanneunggeomId}
                        onChange={(e) => setHanneunggeomId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                        placeholder="공식 홈페이지(historyexam.go.kr) 아이디"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">한능검 공식 사이트 비밀번호 (선택)</label>
                    <input 
                        type="password" 
                        value={hanneunggeomPassword}
                        onChange={(e) => setHanneunggeomPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                        placeholder="공식 홈페이지 비밀번호 (실시간 시험정보 연동용)"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">본인의 한능검 신청 현황 및 결과를 실시간 연동하려는 경우에만 입력해 주세요. (더미 데이터 미적용)</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">비밀번호</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">비밀번호 확인</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                    가입하기
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                이미 계정이 있으신가요? <a href="/auth/login" className="text-blue-600 font-medium hover:underline ml-1">로그인</a>
            </p>
        </div>
    );
}
