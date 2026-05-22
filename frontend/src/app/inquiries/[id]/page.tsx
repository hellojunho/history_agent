"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface Writer {
    id?: string;
    nickname: string;
    role: string;
}

interface Inquiry {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    writer: Writer;
}

interface Comment {
    id: string;
    content: string;
    inquiryId: string;
    userId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    writer: Writer;
}

interface DecodedToken {
    userId: string;
    email: string;
    role: string;
}

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
    const { id: inquiryId } = params;
    const router = useRouter();

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);

    const [isInquiryLoading, setIsInquiryLoading] = useState(true);
    const [isCommentsLoading, setIsCommentsLoading] = useState(true);

    // 댓글 작성 State
    const [commentContent, setCommentContent] = useState("");
    const [activeParentId, setActiveParentId] = useState<string | null>(null);
    const [activeParentNickname, setActiveParentNickname] = useState<string | null>(null);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    // 댓글 수정 State
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");

    // 토큰 해독 및 유저 세션 확인
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
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
                    setCurrentUser({
                        userId: payload.userId,
                        email: payload.email,
                        role: payload.role,
                    });
                }
            } catch (e) {
                console.error("Failed to parse token", e);
            }
        }
    }, []);

    // 문의글 상세 조회
    useEffect(() => {
        const fetchInquiry = async () => {
            try {
                const data = await apiRequest<Inquiry>(`/api/inquiries/${inquiryId}`);
                setInquiry(data);
            } catch (error) {
                console.error("Failed to fetch inquiry:", error);
                alert("문의글을 불러올 수 없거나 권한이 없습니다.");
                router.push("/inquiries");
            } finally {
                setIsInquiryLoading(false);
            }
        };

        fetchInquiry();
    }, [inquiryId, router]);

    // 댓글 목록 조회
    const fetchComments = useCallback(async () => {
        setIsCommentsLoading(true);
        try {
            const data = await apiRequest<Comment[]>(`/api/inquiries/${inquiryId}/comments`);
            setComments(data);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setIsCommentsLoading(false);
        }
    }, [inquiryId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // 문의글 삭제
    const handleInquiryDelete = async () => {
        const confirmDelete = confirm("정말로 이 문의글을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await apiRequest(`/api/inquiries/${inquiryId}`, {
                method: "DELETE",
            });
            alert("문의글이 성공적으로 삭제되었습니다.");
            router.push("/inquiries");
        } catch (error: any) {
            alert(error.message || "삭제 권한이 없거나 오류가 발생했습니다.");
        }
    };

    // 댓글/답글 등록
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        if (!currentUser) {
            alert("댓글을 작성하려면 로그인이 필요합니다.");
            router.push("/auth/login");
            return;
        }

        setIsCommentSubmitting(true);
        try {
            await apiRequest(`/api/inquiries/${inquiryId}/comments`, {
                method: "POST",
                body: JSON.stringify({
                    content: commentContent,
                    parentId: activeParentId,
                }),
            });
            setCommentContent("");
            setActiveParentId(null);
            setActiveParentNickname(null);
            await fetchComments();
        } catch (error: any) {
            alert(error.message || "댓글 등록 중 오류가 발생했습니다.");
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    // 답글 버튼 클릭 핸들러 (닉네임 태그 자동 추가)
    const handleReplyClick = (parentCommentId: string, parentNickname: string) => {
        if (!currentUser) {
            alert("답글을 작성하려면 로그인이 필요합니다.");
            router.push("/auth/login");
            return;
        }
        setActiveParentId(parentCommentId);
        setActiveParentNickname(parentNickname);
        
        // a 사용자의 닉네임이 @a 라고 접두사로 추가
        setCommentContent(`@${parentNickname} `);
        
        // 입력 필드로 스크롤 및 포커스 유도
        const inputElement = document.getElementById("comment-input");
        if (inputElement) {
            inputElement.focus();
        }
    };

    // 답글 작성 취소 핸들러
    const handleCancelReply = () => {
        setActiveParentId(null);
        setActiveParentNickname(null);
        setCommentContent("");
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId: string) => {
        const confirmDelete = confirm("정말로 이 댓글을 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await apiRequest(`/api/inquiries/${inquiryId}/comments/${commentId}`, {
                method: "DELETE",
            });
            await fetchComments();
        } catch (error: any) {
            alert(error.message || "댓글 삭제 권한이 없습니다.");
        }
    };

    // 댓글 수정 폼 열기
    const handleCommentEditStart = (commentId: string, currentText: string) => {
        setEditingCommentId(commentId);
        setEditingContent(currentText);
    };

    // 댓글 수정 취소
    const handleCommentEditCancel = () => {
        setEditingCommentId(null);
        setEditingContent("");
    };

    // 댓글 수정 저장
    const handleCommentEditSave = async (commentId: string) => {
        if (!editingContent.trim()) return;

        try {
            await apiRequest(`/api/inquiries/${inquiryId}/comments/${commentId}`, {
                method: "PUT",
                body: JSON.stringify({ content: editingContent }),
            });
            setEditingCommentId(null);
            setEditingContent("");
            await fetchComments();
        } catch (error: any) {
            alert(error.message || "댓글 수정 권한이 없습니다.");
        }
    };

    if (isInquiryLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">문의글 내용을 불러오는 중입니다...</p>
            </div>
        );
    }

    if (!inquiry) return null;

    const isAuthor = currentUser && inquiry.writer.id === currentUser.userId;
    const isAdmin = currentUser && currentUser.role === "admin";

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
            {/* Header & Back Button */}
            <div>
                <button
                    onClick={() => router.push("/inquiries")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-toss-gray500 hover:text-toss-gray800 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    전체 문의글 목록으로
                </button>
            </div>

            {/* Inquiry Content Card */}
            <article className="bg-white rounded-3xl border border-toss-gray200/80 p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4 pb-6 border-b border-toss-gray100">
                    <div className="space-y-3">
                        <h1 className="text-2xl font-black text-toss-gray900 tracking-tight leading-snug">{inquiry.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-toss-gray500">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${inquiry.writer.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-toss-gray100 text-toss-gray600"}`}>
                                {inquiry.writer.nickname}
                            </span>
                            <span>•</span>
                            <span className="font-semibold">
                                {new Date(inquiry.createdAt).toLocaleString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Edit/Delete permissions for author or admin */}
                    {(isAuthor || isAdmin) && (
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => router.push(`/inquiries/write?id=${inquiry.id}`)}
                                className="px-3.5 py-1.5 rounded-xl border border-toss-gray200 text-xs text-toss-gray700 font-bold hover:bg-toss-gray50 transition-colors"
                            >
                                수정
                            </button>
                            <button
                                onClick={handleInquiryDelete}
                                className="px-3.5 py-1.5 rounded-xl border border-red-100 text-xs text-red-600 font-bold hover:bg-red-50 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-base text-toss-gray800 leading-relaxed whitespace-pre-wrap py-2">
                    {inquiry.content}
                </div>
            </article>

            {/* Comments Area */}
            <div className="space-y-6">
                <h3 className="text-lg font-black text-toss-gray900">댓글 ({comments.length})</h3>

                {isCommentsLoading && comments.length === 0 ? (
                    <div className="py-8 text-center text-toss-gray400 text-sm">댓글 로딩 중...</div>
                ) : comments.length === 0 ? (
                    <div className="bg-toss-gray50/50 rounded-3xl p-8 text-center text-sm text-toss-gray500 border border-toss-gray100">
                        아직 댓글이 없습니다. 첫 답변이나 문의 사항에 대한 조언을 달아보세요!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => {
                            const isCommentAuthor = currentUser && comment.userId === currentUser.userId;
                            const isCommentAdmin = currentUser && currentUser.role === "admin";
                            const isReply = comment.parentId !== null;

                            return (
                                <div
                                    key={comment.id}
                                    className={`bg-white rounded-2xl border border-toss-gray200/80 p-5 shadow-sm transition-all hover:border-toss-gray300/80 ${isReply ? "ml-8 border-l-4 border-l-toss-blue/40 bg-blue-50/10" : ""}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2 flex-1">
                                            {/* Writer details */}
                                            <div className="flex items-center gap-2 text-xs">
                                                {isReply && (
                                                    <span className="text-toss-blue text-sm font-bold animate-pulse">↳</span>
                                                )}
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${comment.writer.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-toss-gray100 text-toss-gray600"}`}>
                                                    {comment.writer.nickname}
                                                </span>
                                                <span className="text-toss-gray400">•</span>
                                                <span className="font-semibold text-toss-gray400">
                                                    {new Date(comment.createdAt).toLocaleString("ko-KR", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>

                                            {/* Content or Edit Form */}
                                            {editingCommentId === comment.id ? (
                                                <div className="space-y-3 pt-2">
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        className="w-full h-24 p-3 rounded-xl border border-toss-gray200 focus:outline-none focus:ring-2 focus:ring-toss-blue/30 text-sm bg-toss-gray50/50 resize-none"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleCommentEditCancel}
                                                            className="px-3 py-1.5 rounded-lg border border-toss-gray200 text-xs text-toss-gray700 font-bold"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleCommentEditSave(comment.id)}
                                                            className="px-3 py-1.5 rounded-lg bg-toss-blue hover:bg-toss-blueHover text-white text-xs font-bold"
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-toss-gray800 leading-relaxed whitespace-pre-wrap pt-1">
                                                    {/* 만약 @로 시작하는 닉네임이 있다면 강조 처리 */}
                                                    {comment.content.split(/(\s+)/).map((word, index) => {
                                                        if (word.startsWith("@")) {
                                                            return (
                                                                <span key={index} className="text-toss-blue font-extrabold bg-toss-blue/5 px-1 py-0.5 rounded mr-0.5">
                                                                    {word}
                                                                </span>
                                                            );
                                                        }
                                                        return word;
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions: Reply / Edit / Delete */}
                                        {editingCommentId !== comment.id && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* 답글 버튼은 대댓글이 아닌 일반 댓글(parentId가 없음)에만 제공하거나, 
                                                    구조상 간소화를 위해 모든 댓글/답글에서 답글 작성을 지원 (클릭 시 작성자를 닉네임으로 자동 태그) */}
                                                <button
                                                    onClick={() => handleReplyClick(comment.id, comment.writer.nickname)}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] text-toss-blue hover:bg-toss-blue/5 font-bold transition-all"
                                                >
                                                    답글
                                                </button>
                                                {(isCommentAuthor || isCommentAdmin) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleCommentEditStart(comment.id, comment.content)}
                                                            className="p-1 rounded-lg text-toss-gray400 hover:text-toss-gray700 hover:bg-toss-gray50 transition-all"
                                                            title="수정"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleCommentDelete(comment.id)}
                                                            className="p-1 rounded-lg text-toss-gray400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                            title="삭제"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Comment Input Box */}
                <div className="bg-white rounded-3xl border border-toss-gray200/80 p-6 shadow-sm space-y-4">
                    {/* Active Reply Banner */}
                    {activeParentId && (
                        <div className="flex justify-between items-center bg-toss-blue/5 border border-toss-blue/10 px-4 py-2.5 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-xs text-toss-blue font-bold">
                                <span className="animate-pulse">↳</span>
                                <span>{activeParentNickname}님에게 답글 작성 중...</span>
                            </div>
                            <button
                                onClick={handleCancelReply}
                                className="text-xs font-black text-toss-gray400 hover:text-toss-gray700 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <textarea
                            id="comment-input"
                            placeholder={currentUser ? "도움이 되는 친절한 답변이나 의견을 남겨주세요." : "로그인 후 댓글을 남길 수 있습니다."}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            disabled={!currentUser || isCommentSubmitting}
                            className="w-full h-28 px-4 py-3 rounded-2xl border border-toss-gray200 focus:outline-none focus:ring-2 focus:ring-toss-blue/30 focus:border-toss-blue text-sm transition-all bg-toss-gray50/30 resize-none leading-relaxed"
                            maxLength={1000}
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-toss-gray400 font-semibold">
                                {currentUser ? `${commentContent.length}/1000자` : "로그인 후 활성화됩니다."}
                            </p>
                            <button
                                type="submit"
                                disabled={!currentUser || !commentContent.trim() || isCommentSubmitting}
                                className="px-5 py-2.5 rounded-2xl bg-toss-blue hover:bg-toss-blueHover disabled:bg-toss-gray200 disabled:text-toss-gray400 text-white text-sm font-bold transition-all active:scale-95 shadow-sm"
                            >
                                {isCommentSubmitting ? "등록 중..." : activeParentId ? "답글 등록" : "댓글 등록"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
