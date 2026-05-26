"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Sparkles, AlertCircle, Edit3 } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface PostDetail {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    writer: {
        id: string;
    };
}

function BoardWriteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            router.push(`/auth/login?redirect=/board/write${editId ? `?edit=${editId}` : ""}`);
            return;
        }

        const fetchPostForEdit = async (id: string) => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await apiRequest<PostDetail>(`/api/board/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res) {
                    setTitle(res.title);
                    setContent(res.content);
                    setImageUrl(res.imageUrl || "");
                }
            } catch (error) {
                console.error("Failed to load post for edit", error);
                setErrorMessage("게시글 정보를 불러오는 데 실패했습니다.");
            }
        };

        if (editId) {
            setIsEditMode(true);
            fetchPostForEdit(editId);
        }
    }, [editId, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 용량제한 (2MB 이하)
        if (file.size > 2 * 1024 * 1024) {
            alert("이미지 크기는 최대 2MB까지 허용됩니다.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setErrorMessage("제목과 내용을 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("accessToken");
            if (isEditMode && editId) {
                // UPDATE POST
                await apiRequest(`/api/board/${editId}`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title, content, imageUrl: imageUrl || null }),
                });
                alert("게시글이 성공적으로 수정되었습니다.");
                router.push(`/board/${editId}`);
            } else {
                // CREATE POST
                const res = await apiRequest<{ id: string }>(`/api/board`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title, content, imageUrl: imageUrl || null }),
                });
                alert("게시글이 성공적으로 등록되었습니다.");
                router.push(`/board/${res?.id || ""}`);
            }
        } catch (error: any) {
            console.error("Failed to submit post", error);
            setErrorMessage(error.message || "서버 통신 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
            <div className="page-container max-w-2xl">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href={isEditMode && editId ? `/board/${editId}` : "/board"}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        돌아가기
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-200/60 shadow-md space-y-6">
                    <div className="border-b pb-4 flex items-center gap-2">
                        <span className="rounded-xl bg-blue-600/10 p-2 text-blue-700">
                            {isEditMode ? <Edit3 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditMode ? "게시글 수정하기" : "새로운 자유게시글 등록"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isEditMode
                                    ? "내용을 다듬어 게시판 소통을 이어나가 보세요."
                                    : "함께 공부하는 한국사 동료들과 유용한 정보를 나누어 보세요."}
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 p-4 rounded-2xl text-xs font-bold text-red-600">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-xs font-extrabold text-slate-800 block">
                                게시글 제목
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="한국사 1급 합격 비결 나눕니다!"
                                maxLength={100}
                                disabled={isSubmitting}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 focus:outline-none"
                            />
                        </div>

                        {/* Content TextArea */}
                        <div className="space-y-2">
                            <label htmlFor="content" className="text-xs font-extrabold text-slate-800 block">
                                게시글 본문 내용
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="공부 방법이나 궁금한 사실을 구체적으로 적어 주세요. 타인에게 모욕적이거나 혐오적인 표현은 게시물 삭제 조치될 수 있습니다."
                                rows={10}
                                disabled={isSubmitting}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm font-semibold leading-relaxed transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Image Upload Option */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-800 block">
                                이미지 첨부 (최대 2MB)
                            </label>
                            
                            {!imageUrl ? (
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50/50 hover:border-blue-500 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p className="mb-1 text-xs text-slate-500 font-bold">이미지 파일을 선택해 주세요</p>
                                            <p className="text-[10px] text-slate-400">PNG, JPG, JPEG (Max 2MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isSubmitting}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-xs group shadow-sm bg-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Uploaded attachment" className="w-full h-auto object-cover max-h-48" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        disabled={isSubmitting}
                                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1.5 transition-all opacity-90 hover:opacity-100 shadow"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.995]"
                        >
                            <img className="hidden" alt="" /> {/* Placeholder fallback */}
                            <Send className="w-4 h-4" />
                            {isSubmitting
                                ? "게시 중..."
                                : isEditMode
                                ? "게시글 수정 완료"
                                : "작성 완료 및 게시하기"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function BoardWritePage() {
    return (
        <Suspense fallback={
            <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-sm text-slate-400 font-extrabold">로딩 중...</div>
            </div>
        }>
            <BoardWriteForm />
        </Suspense>
    );
}
