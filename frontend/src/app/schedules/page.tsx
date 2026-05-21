"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface ExamSchedule {
    id: number;
    round: number;
    year: number;
    examDate: string;
    registerStart: string;
    registerEnd: string;
    resultDate: string;
    status: "진행 중" | "마감";
    isSubscribed: boolean;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const data = await apiRequest<ExamSchedule[]>("/api/exams/schedules");
            setSchedules(data);
            if (data && data.length > 0) {
                const years = data.map(s => s.year);
                const maxYear = Math.max(...years);
                setSelectedYear(maxYear);
            }
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleNotification = async (scheduleId: number, isCurrentlySubscribed: boolean) => {
        if (!isLoggedIn) {
            alert("알림 신청은 로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.");
            router.push("/auth/login");
            return;
        }

        try {
            if (isCurrentlySubscribed) {
                // 알림 구독 취소
                await apiRequest(`/api/exams/schedules/${scheduleId}/notification`, {
                    method: "DELETE"
                });
                alert("시험 일정 알림 신청이 안전하게 취소되었습니다.");
            } else {
                // 알림 구독 신청
                await apiRequest(`/api/exams/schedules/${scheduleId}/notification`, {
                    method: "POST"
                });
                alert("알림 신청이 완료되었습니다! 접수 시작일, 마감 7일 전, 마감 당일에 이메일로 안내해 드립니다.");
            }
            
            // 데이터 재조회하여 상태 최신화
            fetchSchedules();
        } catch (error: any) {
            alert(error.message || "알림 설정 업데이트에 실패했습니다.");
        }
    };

    const formatDateString = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // 연도 필터링
    const filteredSchedules = schedules.filter(s => s.year === selectedYear);
    const availableYears = Array.from(new Set(schedules.map(s => s.year)));
    if (availableYears.length === 0 && !isLoading) {
        availableYears.push(2026);
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
            {/* 상단 소개 배너 */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <svg width="300" height="300" fill="currentColor" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" />
                    </svg>
                </div>
                <div className="max-w-2xl space-y-3 z-10 relative">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">한능검 일정 및 메일링</span>
                    <h1 className="text-3xl font-extrabold tracking-tight">한국사능력검정시험 일정 안내</h1>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        원하시는 시험 회차의 **알람 버튼**을 켜두시면 원서 접수 시작일, 접수 마감 7일 전, 접수 마감 당일 총 3번에 걸쳐 회원가입 시 입력하신 이메일로 놓치지 않게 안내 메일을 발송해 드립니다.
                    </p>
                </div>
            </div>

            {/* 필터 세션 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">연도별 시험 일정 검색</h2>
                    <p className="text-xs text-gray-400 mt-1">원하시는 연도의 한능검 상세 접수 일정을 한눈에 모아보세요.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">조회 연도</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 bg-gray-50/50"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}년</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 일정 리스트 그리드/테이블 */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">시험 일정을 불러오는 중입니다...</p>
                </div>
            ) : filteredSchedules.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 font-bold">등록된 시험 일정이 없습니다.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100">
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">회차</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">상태</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">원서 접수 기간</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">시험 일자</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">합격자 발표일</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">알림 이메일 신청</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSchedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-blue-50/10 transition-colors group">
                                        {/* 회차 타이틀 (클릭 시 공식 원서접수처 이동) */}
                                        <td className="py-5 px-6 font-bold text-gray-800 text-sm">
                                            <a
                                                href="https://www.historyexam.go.kr"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="한능검 공식 접수처 새 창 열기"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline group-hover:translate-x-0.5 transition-transform"
                                            >
                                                제 {schedule.round}회 시험
                                                <svg className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </td>
                                        
                                        {/* 상태 배지 */}
                                        <td className="py-5 px-6 text-xs">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full font-bold ${
                                                    schedule.status === "진행 중"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {schedule.status}
                                            </span>
                                        </td>
                                        
                                        {/* 원서 접수 기간 */}
                                        <td className="py-5 px-6 text-xs font-semibold text-gray-600 leading-relaxed">
                                            <span className="block font-bold text-gray-800">
                                                {formatDateString(schedule.registerStart)}
                                            </span>
                                            <span className="block text-gray-400 font-bold my-0.5 text-[10px]">TO</span>
                                            <span className="block font-bold text-red-600">
                                                {formatDateString(schedule.registerEnd)}
                                            </span>
                                        </td>
                                        
                                        {/* 시험 일자 */}
                                        <td className="py-5 px-6 text-sm font-bold text-gray-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {formatDateString(schedule.examDate)}
                                            </div>
                                        </td>
                                        
                                        {/* 합격 발표일 */}
                                        <td className="py-5 px-6 text-sm font-semibold text-gray-600">
                                            {formatDateString(schedule.resultDate)}
                                        </td>
                                        
                                        {/* 알람 신청 버튼 */}
                                        <td className="py-5 px-6 text-center">
                                            <button
                                                onClick={() => handleToggleNotification(schedule.id, schedule.isSubscribed)}
                                                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 ${
                                                    schedule.isSubscribed
                                                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:text-green-800"
                                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                                                }`}
                                            >
                                                {schedule.isSubscribed ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-green-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                        </svg>
                                                        알림 해제
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        알림 받기
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 하단 보조 팁 카드 */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                        한능검 시험 접수 꿀팁
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        원서 접수 첫날에는 트래픽 폭주가 발생할 수 있습니다. 미리 한국사능력검정시험 회원가입 및 사진 등록을 마치시길 권장합니다.
                    </p>
                </div>
                <a
                    href="https://www.historyexam.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-5 py-3 bg-white text-xs font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 text-center transition-colors active:scale-95 shadow-sm"
                >
                    한능검 공식홈페이지 바로가기
                </a>
            </div>
        </div>
    );
}
