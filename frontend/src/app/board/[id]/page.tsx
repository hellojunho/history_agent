"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Heart, Edit3, Trash2, Send, Clock, User, Award, AlertCircle } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    writer: {
        id: string;
        nickname: string;
        profileImage: string | null;
        role: string;
    };
}

interface PostDetail {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
    likeCount: number;
    isLiked: boolean;
    writer: {
        id: string;
        nickname: string;
        profileImage: string | null;
        role: string;
    };
    comments: Comment[];
}

export default function BoardDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id: postId } = params;

    const [post, setPost] = useState<PostDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    const fetchPostDetail = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await apiRequest<PostDetail>(`/api/board/${postId}`, { headers });
            setPost(res || null);
        } catch (error) {
            console.error("Failed to load post detail", error);
            alert("존재하지 않거나 삭제된 게시글입니다.");
            router.push("/board");
        } finally {
            setIsLoading(false);
        }
    }, [postId, router]);

    useEffect(() => {
        // Decode token to find current user information
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const payloadStr = token.split(".")[1];
                const base64Url = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
                const base64 = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
                const payload = JSON.parse(atob(base64));
                setCurrentUserId(payload.userId);
                setIsAdmin(payload.role === "admin");
            } catch (e) {
                console.error("Failed to decode user token", e);
            }
        }

        fetchPostDetail();
    }, [fetchPostDetail]);

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
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Handle Like Toggle
    const handleLikeToggle = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            router.push("/auth/login?redirect=" + window.location.pathname);
            return;
        }

        if (isLiking || !post) return;
        setIsLiking(true);

        try {
            const res = await apiRequest<{ isLiked: boolean; likeCount: number }>(`/api/board/${postId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res) {
                setPost({
                    ...post,
                    isLiked: res.isLiked,
                    likeCount: res.likeCount,
                });
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        } finally {
            setIsLiking(false);
        }
    };

    // Handle Comment Submit
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            router.push("/auth/login?redirect=" + window.location.pathname);
            return;
        }

        if (!commentContent.trim()) return;
        setIsSubmittingComment(true);

        try {
            await apiRequest(`/api/board/${postId}/comments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: commentContent }),
            });
            setCommentContent("");
            fetchPostDetail(); // reload post and comments
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("댓글 등록에 실패했습니다.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Handle Comment Delete
    const handleCommentDelete = async (commentId: string) => {
        if (!confirm("댓글을 정말로 삭제하시겠습니까?")) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await apiRequest(`/api/board/${postId}/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchPostDetail();
        } catch (error) {
            console.error("Failed to delete comment", error);
            alert("댓글 삭제 권한이 없거나 오류가 발생했습니다.");
        }
    };

    // Handle Post Delete
    const handlePostDelete = async () => {
        if (!confirm("게시글을 정말로 삭제하시겠습니까?")) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await apiRequest(`/api/board/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("게시글이 성공적으로 삭제되었습니다.");
            router.push("/board");
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("게시글 삭제에 실패했습니다.");
        }
    };

    if (isLoading) {
        return (
            <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
                <div className="page-container max-w-3xl space-y-6">
                    <div className="h-6 bg-slate-200 rounded w-16 animate-pulse" />
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm animate-pulse space-y-6">
                        <div className="h-10 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                        <div className="space-y-2 pt-6">
                            <div className="h-4 bg-slate-200 rounded w-full" />
                            <div className="h-4 bg-slate-200 rounded w-5/6" />
                            <div className="h-4 bg-slate-200 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) return null;

    const isAuthor = post.writer.id === currentUserId;

    return (
        <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
            <div className="page-container max-w-3xl">
                {/* Back Link */}
                <div className="mb-6 flex justify-between items-center">
                    <Link
                        href="/board"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        게시판 목록으로
                    </Link>

                    {/* Post Control Panel (Author or Admin Only) */}
                    {(isAuthor || isAdmin) && (
                        <div className="flex items-center gap-1.5">
                            {isAuthor && (
                                <Link
                                    href={`/board/write?edit=${post.id}`}
                                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    수정
                                </Link>
                            )}
                            <button
                                onClick={handlePostDelete}
                                className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 text-red-600 font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Post Card */}
                <article className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200/60 shadow-sm space-y-6">
                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
                        {post.title}
                    </h1>

                    {/* Author Meta Info */}
                    <div className="flex items-center justify-between border-y border-slate-100 py-4 gap-4">
                        <div className="flex items-center gap-3">
                            {post.writer.profileImage ? (
                                <img
                                    src={post.writer.profileImage}
                                    alt={post.writer.nickname}
                                    className="w-11 h-11 rounded-full border border-slate-100 object-cover"
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50">
                                    <User className="w-5.5 h-5.5" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                                    {post.writer.nickname}
                                    {post.writer.role === "admin" && (
                                        <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 leading-none">
                                            ADMIN
                                        </span>
                                    )}
                                </h3>
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(post.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Attached Image */}
                    {post.imageUrl && (
                        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 max-w-full inline-block shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.imageUrl}
                                alt="Attached asset"
                                className="w-full h-auto object-contain max-h-[500px]"
                            />
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="text-slate-800 text-sm sm:text-base leading-8 font-medium whitespace-pre-line min-h-[150px]">
                        {post.content}
                    </div>

                    {/* Interactive Like Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 justify-center sm:justify-start">
                        <button
                            onClick={handleLikeToggle}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all text-xs font-bold ${
                                post.isLiked
                                    ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            } active:scale-95`}
                        >
                            <Heart className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-600 animate-pulse" : "text-slate-400"}`} />
                            좋아요 <span className="font-extrabold">{post.likeCount}</span>
                        </button>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-black text-slate-950">
                            댓글 <span className="text-blue-600 font-extrabold">{post.comments.length}</span>
                        </h2>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                        {post.comments.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200/60 shadow-sm text-slate-400 text-xs font-bold">
                                아직 등록된 댓글이 없습니다. 첫 소통의 불씨를 지펴보세요!
                            </div>
                        ) : (
                            post.comments.map((comment) => {
                                const isCommentAuthor = comment.writer.id === currentUserId;
                                return (
                                    <div
                                        key={comment.id}
                                        className="bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-sm flex gap-4 transition-all relative overflow-hidden group"
                                    >
                                        {/* Avatar */}
                                        {comment.writer.profileImage ? (
                                            <img
                                                src={comment.writer.profileImage}
                                                alt={comment.writer.nickname}
                                                className="w-9 h-9 rounded-full border border-slate-100 object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50 flex-shrink-0">
                                                <User className="w-4.5 h-4.5" />
                                            </div>
                                        )}

                                        {/* Comment Body */}
                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-xs font-black text-slate-950 truncate">
                                                        {comment.writer.nickname}
                                                    </span>
                                                    {comment.writer.role === "admin" && (
                                                        <span className="bg-red-50 text-red-600 text-[8px] font-extrabold px-1 rounded border border-red-200 leading-none">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">
                                                        {formatTime(comment.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Delete Comment Button (Author or Admin Only) */}
                                                {(isCommentAuthor || isAdmin) && (
                                                    <button
                                                        onClick={() => handleCommentDelete(comment.id)}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50/50 p-1 px-2 rounded-lg transition-colors flex-shrink-0"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Comment Writer Form */}
                    <form onSubmit={handleCommentSubmit} className="bg-white p-4 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-3">
                        <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder={currentUserId ? "따뜻한 격려와 건전한 질문을 달아보세요." : "로그인 후 댓글 소통을 진행할 수 있습니다."}
                            disabled={!currentUserId || isSubmittingComment}
                            className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!currentUserId || !commentContent.trim() || isSubmittingComment}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 active:scale-95"
                        >
                            <Send className="w-4.5 h-4.5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
