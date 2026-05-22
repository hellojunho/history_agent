"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface Inquiry {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    writer: {
        nickname: string;
        role: string;
    };
}

export default function InquiryListPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);

        const fetchInquiries = async () => {
            try {
                const data = await apiRequest<Inquiry[]>("/api/inquiries");
                setInquiries(data);
            } catch (error) {
                console.error("Failed to fetch inquiries:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInquiries();
    }, []);

    const handleWriteClick = () => {
        if (!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
            router.push("/auth/login");
        } else {
            router.push("/inquiries/write");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">문의사항 목록을 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            {/* Header section with gradient background accent */}
            <div className="relative rounded-3xl bg-gradient-to-br from-toss-blue/5 via-blue-50/50 to-white border border-toss-blue/10 p-8 shadow-sm overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <svg className="w-64 h-64 text-toss-blue" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                    </svg>
                </div>
                <div className="relative z-10 space-y-3">
                    <span className="inline-flex px-3 py-1 bg-toss-blue/10 text-toss-blue text-xs font-black rounded-full tracking-wider uppercase">Inquiry</span>
                    <h1 className="text-3xl font-black text-toss-gray900 tracking-tight">문의 및 건의사항</h1>
                    <p className="text-sm text-toss-gray600 leading-relaxed max-w-xl">
                        서비스 이용 중 불편하셨던 점이나 개선이 필요한 사항을 보내주시면 관리자가 성심성의껏 답변해 드립니다.
                    </p>
                </div>
            </div>

            {/* List & Write Button Area */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-toss-gray800">전체 게시글</span>
                        <span className="bg-toss-gray100 text-toss-gray600 text-xs font-bold px-2 py-0.5 rounded-full">{inquiries.length}개</span>
                    </div>
                    <button
                        onClick={handleWriteClick}
                        className="px-5 py-2.5 bg-toss-blue hover:bg-toss-blueHover text-white text-sm font-bold rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                        </svg>
                        문의하기
                    </button>
                </div>

                {inquiries.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-toss-gray200/80 p-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-toss-gray50 rounded-full flex items-center justify-center mx-auto border border-toss-gray100">
                            <svg className="w-8 h-8 text-toss-gray400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-toss-gray800">등록된 문의사항이 없습니다</p>
                            <p className="text-xs text-toss-gray500">첫 번째 문의글의 주인공이 되어보세요!</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-toss-gray200/80 divide-y divide-toss-gray100 overflow-hidden shadow-sm">
                        {inquiries.map((inquiry) => (
                            <Link
                                key={inquiry.id}
                                href={`/inquiries/${inquiry.id}`}
                                className="block p-6 hover:bg-toss-gray50/60 transition-colors group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2 flex-1">
                                        <h2 className="text-base font-bold text-toss-gray900 group-hover:text-toss-blue transition-colors flex items-center gap-2">
                                            {inquiry.title}
                                        </h2>
                                        <p className="text-sm text-toss-gray500 line-clamp-1">{inquiry.content}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1.5 text-right shrink-0">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${inquiry.writer.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-toss-gray100 text-toss-gray600"}`}>
                                            {inquiry.writer.nickname}
                                        </span>
                                        <span className="text-xs font-semibold text-toss-gray400">
                                            {new Date(inquiry.createdAt).toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
