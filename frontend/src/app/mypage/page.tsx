"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { User, FileText, LayoutDashboard } from "lucide-react";
import AdminPage from "@/app/admin/page";

export default function MyPage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // 새 닉네임 및 프로필 이미지 업로드 상태
    const [newNickname, setNewNickname] = useState("");
    const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [nicknameError, setNicknameError] = useState("");

    // 새 탭 상태 및 활동 내역 상태
    const [activeTab, setActiveTab] = useState<"profile" | "activity" | "admin">("profile");
    const [activities, setActivities] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "post" | "comment" | "like">("all");
    const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

    // CBT 오답 통계 상태
    const [wrongCount, setWrongCount] = useState<number>(0);

    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const data = await apiRequest<any>("/api/users/me");
            setProfile(data);
            if (data.nickname) {
                setNewNickname(data.nickname);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            alert("로그인이 필요하거나 세션이 만료되었습니다.");
            localStorage.removeItem("accessToken");
            window.location.href = "/auth/login";
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateNickname = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newNickname.trim();
        if (!trimmed) {
            alert("변경할 닉네임을 입력해주세요.");
            return;
        }

        setIsUpdatingNickname(true);
        setNicknameError("");

        try {
            const result = await apiRequest<any>("/api/users/me", {
                method: "PATCH",
                body: JSON.stringify({ nickname: trimmed })
            });
            alert(result.message || "닉네임이 성공적으로 변경되었습니다.");
            setProfile((prev: any) => ({ ...prev, nickname: trimmed }));
            setNicknameError("");
        } catch (error: any) {
            setNicknameError(error.message || "닉네임 변경에 실패했습니다.");
        } finally {
            setIsUpdatingNickname(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("프로필 이미지는 최대 2MB까지 업로드할 수 있습니다.");
            return;
        }

        setIsUploadingImage(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                const result = await apiRequest<any>("/api/users/me", {
                    method: "PATCH",
                    body: JSON.stringify({ profileImage: base64 })
                });
                setProfile((prev: any) => ({ ...prev, profileImage: base64 }));
                alert(result.message || "프로필 이미지가 성공적으로 업데이트되었습니다.");
            } catch (error: any) {
                alert(error.message || "프로필 이미지 수정에 실패했습니다.");
            } finally {
                setIsUploadingImage(false);
            }
        };
        reader.onerror = () => {
            alert("이미지 파일을 읽는 데 실패했습니다.");
            setIsUploadingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const fetchActivities = useCallback(async () => {
        setActivityLoading(true);
        try {
            const data = await apiRequest<any[]>(`/api/users/me/activities?type=${filterType}&sort=${sortOrder}`);
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setActivityLoading(false);
        }
    }, [filterType, sortOrder]);

    const fetchWrongAnswersCount = async () => {
        try {
            const res = await apiRequest<{ data: any[] }>("/api/users/me/wrong-answers");
            setWrongCount(res.data?.length || 0);
        } catch (error) {
            console.error("Failed to fetch wrong answers count:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/auth/login");
            return;
        }
        fetchProfile();
        fetchWrongAnswersCount();
    }, [router]);

    useEffect(() => {
        if (activeTab === "activity") {
            fetchActivities();
        }
    }, [activeTab, fetchActivities]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("모든 비밀번호 필드를 입력해주세요.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        if (newPassword.length < 4) {
            alert("비밀번호는 최소 4자 이상이어야 합니다.");
            return;
        }

        setIsUpdating(true);
        try {
            await apiRequest("/api/users/me", {
                method: "PUT",
                body: JSON.stringify({ currentPassword, newPassword })
            });
            alert("비밀번호가 성공적으로 변경되었습니다.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            alert(error.message || "비밀번호 변경에 실패했습니다.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleWithdraw = async () => {
        const firstConfirm = confirm("정말로 한국사 학습 서비스를 탈퇴하시겠습니까?");
        if (!firstConfirm) return;

        const secondConfirm = confirm("탈퇴 시 모든 기출 오답 이력 및 학습 데이터가 영구히 소실됩니다. 그래도 계속하시겠습니까?");
        if (!secondConfirm) return;

        setIsWithdrawing(true);
        try {
            await apiRequest("/api/users/me", { method: "DELETE" });
            alert("회원 탈퇴가 안전하게 처리되었습니다. 그동안 이용해주셔서 대단히 감사합니다.");
            localStorage.removeItem("accessToken");
            window.location.href = "/";
        } catch (error: any) {
            alert(error.message || "회원 탈퇴 처리 중 오류가 발생했습니다.");
            setIsWithdrawing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">마이페이지 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
            {/* Header section */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">마이페이지</h1>
                <p className="text-sm text-gray-500 mt-2">나의 회원 정보와 활동 내역을 조회하고 관리할 수 있습니다.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 space-x-8">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
                        activeTab === "profile"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>계정 관리</span>
                </button>
                <button
                    onClick={() => setActiveTab("activity")}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
                        activeTab === "activity"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>내 활동</span>
                </button>
                {profile?.role === "admin" && (
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
                            activeTab === "admin"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>관리자 페이지</span>
                    </button>
                )}
            </div>

            {/* Content Section */}
            {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
                    {/* 1. Account Summary Card (Toss Style Circular Avatar) */}
                    <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        
                        {/* Circular Profile Avatar */}
                        <div className="relative group/avatar mt-2">
                            <div className="w-24 h-24 rounded-full border-2 border-blue-500/20 p-1 flex items-center justify-center bg-white shadow-sm overflow-hidden relative">
                                {profile?.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center">
                                        <span className="text-3xl font-black text-blue-600">
                                            {profile?.nickname?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Camera Edit Overlay Button */}
                            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer transition-all hover:bg-blue-700 hover:scale-105 active:scale-95">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploadingImage}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Nickname & Email */}
                        <div className="space-y-1 w-full text-center">
                            <h3 className="text-base font-black text-gray-900 flex items-center justify-center gap-1.5">
                                {profile?.nickname || "닉네임 없음"}
                                {profile?.role === "admin" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 border border-red-100 text-red-600 font-extrabold font-mono">ADMIN</span>
                                )}
                            </h3>
                            <p className="text-[11px] font-semibold text-gray-400 break-all">{profile?.email}</p>
                        </div>
                        {/* Creation & Role Details */}
                        <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-100 text-left">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">회원 유형</p>
                                <span className={`inline-flex px-2 py-0.5 mt-1 rounded text-xs font-bold ${profile?.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                    {profile?.role === "admin" ? "관리자" : "일반 사용자"}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">가입 일자</p>
                                <p className="text-xs font-semibold text-gray-600 mt-1">
                                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Detail Setup forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* 2-1. Nickname Edit Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center mb-6">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />
                                닉네임 설정
                            </h2>
                            
                            <form onSubmit={handleUpdateNickname} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">새 닉네임</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="새로운 닉네임을 입력하세요"
                                            value={newNickname}
                                            onChange={(e) => setNewNickname(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-gray-50/50"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isUpdatingNickname}
                                            className={`px-6 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${isUpdatingNickname ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
                                        >
                                            {isUpdatingNickname ? "변경 중..." : "닉네임 변경"}
                                        </button>
                                    </div>
                                </div>
                                
                                {nicknameError && (
                                    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-xs font-bold text-orange-700 flex items-start gap-2.5 animate-pulse">
                                        <span className="text-base leading-none">💡</span>
                                        <p className="leading-relaxed">{nicknameError}</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* 2-2. Password Update Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center mb-6">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2" />
                                비밀번호 수정
                            </h2>
                            
                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">현재 비밀번호</label>
                                    <input
                                        type="password"
                                        placeholder="현재 비밀번호를 입력하세요"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-gray-50/50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">새 비밀번호</label>
                                        <input
                                            type="password"
                                            placeholder="새 비밀번호 (4자 이상)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-gray-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">새 비밀번호 확인</label>
                                        <input
                                            type="password"
                                            placeholder="새 비밀번호 다시 입력"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`w-full md:w-auto px-6 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${isUpdating ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
                                    >
                                        {isUpdating ? "수정 중..." : "비밀번호 변경"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Account Deletion / Withdrawal Card */}
                        <div className="bg-red-50/30 rounded-2xl border border-red-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-1.5 max-w-xl">
                                <h3 className="text-sm font-black text-red-800 flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    회원 탈퇴 및 계정 영구 삭제
                                </h3>
                                <p className="text-xs text-red-600 font-medium leading-relaxed">
                                    회원 탈퇴 시 한국사능력검정시험 학습 서비스 내 모든 데이터(기출 시험 통계, 오답 노트, 즐겨찾기 이력 등)가 복구 불가능하게 삭제됩니다.
                                </p>
                            </div>
                            <button
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className={`w-full md:w-auto px-5 py-3 rounded-lg text-xs font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:text-red-800 transition-all ${isWithdrawing ? "opacity-50 cursor-not-allowed" : "active:scale-95 shadow-sm"}`}
                            >
                                {isWithdrawing ? "탈퇴 중..." : "서비스 탈퇴"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. 내 활동 (My Activity) Tab */}
            {activeTab === "activity" && (
                <div className="space-y-8 animate-fadeIn">
                    {/* CBT 오답/풀이 요약 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Wrong Notes Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">나의 오답 노트</h3>
                                    <p className="text-sm text-gray-500 mt-1">풀었던 CBT 기출문제 중 오답들을 다시 보며 오답 원인을 복습할 수 있습니다.</p>
                                </div>
                                <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">저장된 오답 개수</span>
                                    <span className="text-lg font-black text-red-600">{wrongCount}개</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push("/cbt/wrong-notes")}
                                className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                            >
                                오답 노트 바로가기 &rarr;
                            </button>
                        </div>

                        {/* CBT Practice Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">CBT 기출문제 풀이</h3>
                                    <p className="text-sm text-gray-500 mt-1">한국사능력검정시험 역대 기출문제를 실전처럼 풀고 오답을 분석해보세요.</p>
                                </div>
                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">풀이 가능한 회차</span>
                                    <span className="text-sm font-bold text-blue-600">수시 업데이트 중</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push("/cbt")}
                                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                            >
                                기출문제 풀러가기 &rarr;
                            </button>
                        </div>
                    </div>

                    {/* 기존 커뮤니티 활동 내역 리스트 (Activity Panel) */}
                    <div className="space-y-6">
                        <h4 className="text-base font-black text-gray-800 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                            커뮤니티 활동 내역
                        </h4>
                        
                        {/* Controls (Filters & Sorting) */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            {/* Filter Buttons */}
                            <div className="flex bg-white p-1 rounded-xl shadow-inner border border-gray-200 max-w-fit flex-wrap gap-1">
                                <button
                                    onClick={() => setFilterType("all")}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                        filterType === "all"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    전체 활동
                                </button>
                                <button
                                    onClick={() => setFilterType("post")}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                        filterType === "post"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    내가 쓴 글
                                </button>
                                <button
                                    onClick={() => setFilterType("comment")}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                        filterType === "comment"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    내가 쓴 댓글
                                </button>
                                <button
                                    onClick={() => setFilterType("like")}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                        filterType === "like"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                    }`}
                                >
                                    좋아요한 글
                                </button>
                            </div>

                            {/* Sorting Selector */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-gray-500">정렬 기준</span>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
                                >
                                    <option value="latest">최신순</option>
                                    <option value="oldest">오래된순</option>
                                </select>
                            </div>
                        </div>

                        {/* Activity List */}
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-gray-400 font-bold">작성한 내역을 가져오고 있습니다...</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-700">활동 내역이 존재하지 않습니다.</p>
                                    <p className="text-xs text-gray-400">게시판에서 새로운 글이나 댓글을 달아보세요!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        onClick={() => router.push(`/board/${activity.postId}`)}
                                        className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                                    >
                                        <div className="space-y-2.5 max-w-2xl">
                                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                {activity.type === "post" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
                                                        게시글
                                                    </span>
                                                )}
                                                {activity.type === "comment" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
                                                        댓글
                                                    </span>
                                                )}
                                                {activity.type === "like" && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase bg-rose-50 text-rose-600 border border-rose-100 shadow-inner">
                                                        좋아요
                                                    </span>
                                                )}
                                                
                                                <span className="text-xs font-bold text-gray-400">
                                                    {new Date(activity.createdAt).toLocaleDateString("ko-KR", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>

                                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {activity.type === "post" ? activity.title : (activity.type === "comment" ? activity.content : activity.title)}
                                            </h3>

                                            {activity.type === "comment" && (
                                                <p className="text-xs font-medium text-gray-400 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                    </svg>
                                                    원글: {activity.title}
                                                </p>
                                            )}

                                            {activity.type === "like" && (
                                                <p className="text-xs font-medium text-gray-400 flex items-center">
                                                    ❤️ 이 게시글의 유용한 내용에 공감했습니다.
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats (only for posts) */}
                                        {activity.type === "post" && (activity.commentCount > 0 || activity.likeCount > 0) && (
                                            <div className="flex items-center space-x-4 text-xs font-bold text-gray-400 self-end md:self-auto bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100/50">
                                                {activity.likeCount > 0 && (
                                                    <span className="flex items-center text-red-500">
                                                        ❤️ <span className="ml-1 text-gray-500">{activity.likeCount}</span>
                                                    </span>
                                                )}
                                                {activity.commentCount > 0 && (
                                                    <span className="flex items-center text-blue-500">
                                                        💬 <span className="ml-1 text-gray-500">{activity.commentCount}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. 관리자 (Admin) Tab */}
            {activeTab === "admin" && profile?.role === "admin" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <AdminPage />
                </div>
            )}
        </div>
    );
}
