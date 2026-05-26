"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Heart, PenSquare, ArrowUpDown, Clock, ThumbsUp, ChevronRight, User } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
    likeCount: number;
    writer: {
        id: string;
        nickname: string;
        profileImage: string | null;
        role: string;
    };
}

export default function BoardPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState<"latest" | "likes">("latest");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("accessToken"));
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const res = await apiRequest<Post[]>(`/api/board?sort=${sort}`);
                setPosts(res || []);
            } catch (error) {
                console.error("Failed to load posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [sort]);

    // Format relative time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
            <div className="page-container max-w-4xl">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-blue-700 mb-3">
                            <MessageSquare className="h-3.5 w-3.5" />
                            한국사 소통 공간
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.03em] text-slate-950">
                            한능검 자유 게시판
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            함께 공부하는 동료들과 공부 꿀팁 및 질문을 자유롭게 나누어 보세요.
                        </p>
                    </div>
                    <Link
                        href={isLoggedIn ? "/board/write" : "/auth/login?redirect=/board/write"}
                        className="app-button-primary px-6 py-3.5 text-sm sm:self-start flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                    >
                        <PenSquare className="h-4.5 w-4.5" />
                        새 글 작성하기
                    </Link>
                </div>

                {/* Filter and Stats Panel */}
                <div className="glass-panel p-4 mb-6 flex items-center justify-between gap-4 border border-slate-200/60 rounded-[24px]">
                    <span className="text-xs font-extrabold text-slate-500">
                        총 <strong className="text-slate-950 font-black">{posts.length}개</strong>의 게시글
                    </span>

                    <div className="flex items-center border border-slate-200 p-0.5 bg-slate-100/80 rounded-xl">
                        <button
                            onClick={() => setSort("latest")}
                            className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                                sort === "latest"
                                    ? "bg-white text-slate-950 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            최신순
                        </button>
                        <button
                            onClick={() => setSort("likes")}
                            className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                                sort === "likes"
                                    ? "bg-white text-slate-950 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            좋아요순
                        </button>
                    </div>
                </div>

                {/* Listing Section */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-sm animate-pulse space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                                        <div className="h-3 bg-slate-200 rounded w-1/6" />
                                    </div>
                                </div>
                                <div className="h-6 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-200 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-[32px] shadow-sm space-y-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-400">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-950">등록된 게시글이 없습니다.</h3>
                            <p className="text-xs text-slate-500">첫 번째 이야기를 작성해 소통을 시작해 보세요!</p>
                        </div>
                        <Link
                            href={isLoggedIn ? "/board/write" : "/auth/login?redirect=/board/write"}
                            className="inline-flex app-button-secondary px-5 py-2.5 text-xs rounded-xl"
                        >
                            게시글 첫 개시하기
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/board/${post.id}`}
                                className="block bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all hover:scale-[1.005] group"
                            >
                                <div className="space-y-4">
                                    {/* Author Profile and Time */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {post.writer.profileImage ? (
                                                <img
                                                    src={post.writer.profileImage}
                                                    alt={post.writer.nickname}
                                                    className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                                                    {post.writer.nickname}
                                                    {post.writer.role === "admin" && (
                                                        <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 leading-none">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                </h4>
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    {formatTime(post.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </div>

                                    {/* Content Zone */}
                                    <div className="space-y-2">
                                        <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed line-clamp-2">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                                            <Heart className="h-4 w-4 text-slate-400 group-hover:text-red-500 group-hover:fill-red-500/10 transition-colors" />
                                            좋아요 {post.likeCount}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                                            <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            댓글 {post.commentCount}
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
