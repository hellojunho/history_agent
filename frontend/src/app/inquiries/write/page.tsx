"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

function WriteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inquiryId = searchParams.get("id"); // URL에 ?id=uuid 가 존재하면 수정 모드로 진입

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요한 페이지입니다. 로그인 페이지로 이동합니다.");
            router.push("/auth/login");
            return;
        }

        if (inquiryId) {
            // 수정 모드인 경우 기존 글 정보 로드
            const fetchInquiry = async () => {
                setIsFetching(true);
                try {
                    const data = await apiRequest<any>(`/api/inquiries/${inquiryId}`);
                    setTitle(data.title);
                    setContent(data.content);
                } catch (error) {
                    console.error("Failed to fetch inquiry:", error);
                    alert("게시글을 불러올 수 없거나 권한이 없습니다.");
                    router.push("/inquiries");
                } finally {
                    setIsFetching(false);
                }
            };
            fetchInquiry();
        }
    }, [inquiryId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            if (inquiryId) {
                // 수정 처리
                await apiRequest(`/api/inquiries/${inquiryId}`, {
                    method: "PUT",
                    body: JSON.stringify({ title, content }),
                });
                alert("문의사항이 성공적으로 수정되었습니다.");
                router.push(`/inquiries/${inquiryId}`);
            } else {
                // 등록 처리
                const res = await apiRequest<any>("/api/inquiries", {
                    method: "POST",
                    body: JSON.stringify({ title, content }),
                });
                alert("문의사항이 성공적으로 등록되었습니다.");
                router.push(`/inquiries/${res.id}`);
            }
        } catch (error: any) {
            alert(error.message || "오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">기존 문의글 정보를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
            <div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-toss-gray500 hover:text-toss-gray800 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    이전으로
                </button>
                <h1 className="text-2xl font-black text-toss-gray900 tracking-tight">
                    {inquiryId ? "문의글 수정하기" : "새 문의글 작성하기"}
                </h1>
                <p className="text-sm text-toss-gray500 mt-1">이용하면서 겪으신 불편이나 개선 아이디어를 남겨주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-toss-gray200/80 p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="block text-xs font-black text-toss-gray600 uppercase tracking-wide">문의 제목</label>
                    <input
                        type="text"
                        placeholder="문의 제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border border-toss-gray200 focus:outline-none focus:ring-2 focus:ring-toss-blue/30 focus:border-toss-blue text-sm transition-all bg-toss-gray50/30"
                        maxLength={100}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-black text-toss-gray600 uppercase tracking-wide">문의 내용</label>
                    <textarea
                        placeholder="구체적인 내용을 입력해 주세요. 작성해 주신 내용을 확인하여 신속하게 답변해 드립니다."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-72 px-4 py-3.5 rounded-2xl border border-toss-gray200 focus:outline-none focus:ring-2 focus:ring-toss-blue/30 focus:border-toss-blue text-sm transition-all bg-toss-gray50/30 resize-none leading-relaxed"
                        maxLength={2000}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3.5 rounded-2xl border border-toss-gray200 hover:bg-toss-gray50 text-toss-gray800 text-sm font-bold transition-all active:scale-98 text-center"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3.5 rounded-2xl bg-toss-blue hover:bg-toss-blueHover disabled:bg-toss-blue/40 text-white text-sm font-bold transition-all active:scale-98 text-center shadow-sm"
                    >
                        {isLoading ? "등록 중..." : inquiryId ? "수정하기" : "등록하기"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function InquiryWritePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">작성 양식을 로드 중입니다...</p>
            </div>
        }>
            <WriteForm />
        </Suspense>
    );
}
