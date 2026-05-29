"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Bell, BellOff, CalendarDays, Check, X, Mail, Info, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

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
    applyUrl: string;
    regions: string;
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // 지역 필터링용 상태
    const [selectedRegion, setSelectedRegion] = useState<string>("전체");
    
    const regionsList = [
        "전체", "서울", "경기", "인천", "강원", "충북", "충남", "대전", "세종", "전북", "전남", "광주", "경북", "경남", "부산", "대구", "울산", "제주"
    ];

    // 모달 제어용 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
    const [userEmail, setUserEmail] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        if (token) {
            fetchUserProfile();
        }
        fetchSchedules();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const data = await apiRequest<{ email: string }>("/api/users/me");
            if (data && data.email) {
                setUserEmail(data.email);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

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

    // 지역별 정밀 원서 접수 일정 오프셋 계산 헬퍼
    const getRegionRegistrationPeriod = (registerStartStr: string, registerEndStr: string, region: string) => {
        const start = new Date(registerStartStr);
        const end = new Date(registerEndStr);

        const regionGroups = {
            group1: ["인천", "경기"],
            group2: ["대전", "세종", "광주", "충남", "충북", "전남", "전북"],
            group3: ["부산", "대구", "울산", "경남", "경북"],
            group4: ["서울", "강원", "제주"]
        };

        if (region === "전체") {
            return {
                start: start,
                end: end,
                isSplit: false
            };
        }

        let startOffsetDays = 0;
        let firstEndOffsetDays = 0;
        let firstEndHour = 9;

        if (regionGroups.group1.includes(region)) {
            startOffsetDays = 0;
            firstEndOffsetDays = 1;
            firstEndHour = 9;
        } else if (regionGroups.group2.includes(region)) {
            startOffsetDays = 1;
            firstEndOffsetDays = 2;
            firstEndHour = 9;
        } else if (regionGroups.group3.includes(region)) {
            startOffsetDays = 2;
            firstEndOffsetDays = 3;
            firstEndHour = 9;
        } else if (regionGroups.group4.includes(region)) {
            startOffsetDays = 3;
            firstEndOffsetDays = 3;
            firstEndHour = 12; // 4일차 12:00
        } else {
            return {
                start: start,
                end: end,
                isSplit: false
            };
        }

        // 1차 접수 시작일 (10:00)
        const firstStart = new Date(start);
        firstStart.setDate(start.getDate() + startOffsetDays);
        firstStart.setHours(10, 0, 0, 0);

        // 1차 접수 마감일
        const firstEnd = new Date(start);
        firstEnd.setDate(start.getDate() + firstEndOffsetDays);
        firstEnd.setHours(firstEndHour, 0, 0, 0);

        // 2차 전국 접수 시작일 (4일차 13:00)
        const secondStart = new Date(start);
        secondStart.setDate(start.getDate() + 3);
        secondStart.setHours(13, 0, 0, 0);

        // 최종 마감일
        const secondEnd = new Date(end);

        return {
            firstStart,
            firstEnd,
            secondStart,
            secondEnd,
            isSplit: true
        };
    };

    // 선택된 지역 기준의 시험 상태 ("진행 예정" | "진행 중" | "마감") 실시간 연산
    const getRegionScheduleStatus = (schedule: ExamSchedule, region: string): "진행 예정" | "진행 중" | "마감" => {
        const now = new Date();
        const examDate = new Date(schedule.examDate);
        if (now > examDate) {
            return "마감";
        }

        const period = getRegionRegistrationPeriod(schedule.registerStart, schedule.registerEnd, region);
        if (!period.isSplit) {
            const start = period.start!;
            const end = period.end!;
            if (now < start) return "진행 예정";
            if (now > end) return "마감";
            return "진행 중";
        } else {
            const { firstStart, secondEnd } = period;
            if (now < firstStart!) return "진행 예정";
            if (now > secondEnd!) return "마감";
            return "진행 중";
        }
    };

    // 알림 버튼 클릭 시 모달 열기
    const handleOpenNotificationModal = (schedule: ExamSchedule) => {
        if (!isLoggedIn) {
            alert("알림 신청은 로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.");
            router.push("/auth/login");
            return;
        }
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    // 모달 내부에서 최종 승인 버튼 클릭 시 동작
    const handleConfirmNotification = async (scheduleId: number, isCurrentlySubscribed: boolean) => {
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
                alert(`알림 신청이 성공적으로 접수되었습니다!\n가입하신 이메일(${userEmail || "회원 이메일"})로 시작 D-7, D-1, 당일 및 마감 D-7, D-1, 당일 등 총 6회 리마인드 안내를 전송합니다.`);
            }
            
            setIsModalOpen(false);
            fetchSchedules();
        } catch (error: any) {
            alert(error.message || "알림 설정 업데이트에 실패했습니다.");
        }
    };

    // 날짜 및 시각 콤팩트 출력 포맷터 (줄바꿈 원천 방지용)
    const formatDateString = (dateStr: string) => {
        const d = new Date(dateStr);
        const pad = (n: number) => String(n).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hour = pad(d.getHours());
        const minute = pad(d.getMinutes());
        return `${year}.${month}.${day} ${hour}:${minute}`;
    };

    // 연도 및 지역 필터링
    const filteredSchedules = schedules.filter(s => {
        const matchesYear = s.year === selectedYear;
        const matchesRegion = selectedRegion === "전체" || (s.regions && s.regions.split(",").includes(selectedRegion));
        return matchesYear && matchesRegion;
    });

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
                        원하시는 시험 회차의 **알람 버튼**을 켜두시면 원서 접수 시작일, 접수 마감 7일 전, 접수 마감 당일 등 총 6번에 걸쳐 회원가입 시 입력하신 이메일로 놓치지 않게 안내 메일을 발송해 드립니다.
                    </p>
                </div>
            </div>

            {/* 필터 세션 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">연도별 및 지역별 시험 일정 검색</h2>
                    <p className="text-xs text-gray-400 mt-1">원하시는 연도와 접수 가능 지역의 한능검 상세 접수 일정을 한눈에 모아보세요.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
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

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">접수 가능 지역</label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 bg-gray-50/50"
                        >
                            {regionsList.map(region => (
                                <option key={region} value={region}>{region === "전체" ? "전체 지역" : region}</option>
                            ))}
                        </select>
                    </div>
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
                    <p className="text-gray-500 font-bold">선택하신 조건에 해당되는 시험 일정이 없습니다.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100">
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">회차</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">상태</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">원서 접수 기간</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">접수 가능 지역</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">시험 일자</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">합격자 발표일</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">알림 이메일 신청</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSchedules.map((schedule) => (
                                    <tr 
                                        key={schedule.id} 
                                        onClick={() => window.open(schedule.applyUrl, "_blank", "noopener,noreferrer")}
                                        className="hover:bg-blue-50/10 cursor-pointer transition-colors group"
                                    >
                                        {/* 회차 타이틀 (클릭 시 공식 원서접수처 이동) */}
                                        <td className="py-5 px-4 font-bold text-gray-800 text-sm whitespace-nowrap">
                                            <div className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline group-hover:translate-x-0.5 transition-transform">
                                                제 {schedule.round}회 시험
                                                <svg className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </td>
                                        
                                        {/* 상태 배지 */}
                                        <td className="py-5 px-4 text-xs whitespace-nowrap">
                                            {(() => {
                                                const status = getRegionScheduleStatus(schedule, selectedRegion);
                                                let badgeStyle = "bg-gray-100 text-gray-500 border border-gray-200";
                                                if (status === "진행 중") {
                                                    badgeStyle = "bg-blue-50 text-blue-600 border border-blue-200 animate-pulse";
                                                } else if (status === "진행 예정") {
                                                    badgeStyle = "bg-amber-50 text-amber-600 border border-amber-200 font-black";
                                                }
                                                return (
                                                    <span className={`inline-block px-2.5 py-1 rounded-full font-bold shadow-xs ${badgeStyle}`}>
                                                        {status}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        
                                        {/* 원서 접수 기간 */}
                                        <td className="py-5 px-4 text-xs font-semibold text-gray-600 leading-relaxed whitespace-nowrap">
                                            {(() => {
                                                const period = getRegionRegistrationPeriod(schedule.registerStart, schedule.registerEnd, selectedRegion);
                                                if (!period.isSplit) {
                                                    return (
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <span className="text-gray-800">
                                                                {formatDateString(schedule.registerStart)}
                                                            </span>
                                                            <span className="text-gray-400 text-[10px] font-black">~</span>
                                                            <span className="text-red-600">
                                                                {formatDateString(schedule.registerEnd)}
                                                            </span>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="flex flex-col gap-1 min-w-[310px]">
                                                            <div className="bg-blue-50/70 p-1.5 rounded-xl border border-blue-100/50 flex items-center justify-between gap-2">
                                                                <span className="text-[9px] text-blue-800 font-black leading-none whitespace-nowrap">1차 ({selectedRegion})</span>
                                                                <span className="text-gray-700 font-bold whitespace-nowrap text-[11px]">
                                                                    {formatDateString(period.firstStart!.toISOString())} ~ {formatDateString(period.firstEnd!.toISOString())}
                                                                </span>
                                                            </div>
                                                            <div className="bg-indigo-50/70 p-1.5 rounded-xl border border-indigo-100/50 flex items-center justify-between gap-2">
                                                                <span className="text-[9px] text-indigo-800 font-black leading-none whitespace-nowrap">2차 (전국)</span>
                                                                <span className="text-gray-700 font-bold whitespace-nowrap text-[11px]">
                                                                    {formatDateString(period.secondStart!.toISOString())} ~ <span className="text-red-600">{formatDateString(period.secondEnd!.toISOString())}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </td>

                                        {/* 접수 가능 지역 */}
                                        <td className="py-5 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                            {schedule.regions && schedule.regions.split(",").length === 17 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/50 text-blue-700 border border-blue-100 rounded-lg font-bold">
                                                    전국 접수 가능
                                                </span>
                                            ) : (
                                                <div className="inline-flex flex-col gap-0.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold text-[10px]">
                                                        일부 지역 제한
                                                    </span>
                                                    <p className="text-[9px] text-gray-400 max-w-[120px] truncate leading-normal" title={schedule.regions}>
                                                        {schedule.regions}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* 시험 일자 */}
                                        <td className="py-5 px-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {formatDateString(schedule.examDate)}
                                            </div>
                                        </td>
                                        
                                        {/* 합격 발표일 */}
                                        <td className="py-5 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                                            {formatDateString(schedule.resultDate)}
                                        </td>
                                        
                                        {/* 알람 신청 버튼 */}
                                        <td className="py-5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            {getRegionScheduleStatus(schedule, selectedRegion) === "마감" ? (
                                                <button
                                                    disabled
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-xs font-bold cursor-not-allowed shadow-none"
                                                >
                                                    <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    알림 불가
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenNotificationModal(schedule);
                                                    }}
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
                                            )}
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

            {/* 알림 구독/취소 확인 글래스모피즘 모달 */}
            {isModalOpen && selectedSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="relative w-full max-w-lg overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* 데코 백그라운드 그라디언트 */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                        {/* 모달 헤더 */}
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                    {selectedSchedule.isSubscribed ? (
                                        <BellOff className="w-6 h-6 animate-pulse" />
                                    ) : (
                                        <Bell className="w-6 h-6 animate-bounce" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">
                                        {selectedSchedule.isSubscribed ? "알림 신청 취소" : "알림 서비스 신청"}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                                        제 {selectedSchedule.round}회 한국사능력검정시험
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100/80 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 모달 컨텐츠 */}
                        <div className="space-y-4">
                            {selectedSchedule.isSubscribed ? (
                                <div className="space-y-3">
                                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                                        <p className="text-sm font-semibold text-red-800 leading-relaxed">
                                            제 {selectedSchedule.round}회 시험의 원서 접수 알림을 취소하시겠습니까?
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        구독을 해제하시면 접수 일정(시작/마감)에 관한 모든 리마인드 이메일 발송이 안전하게 중단됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">이메일 알림 수신 대상</h4>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <span>{userEmail || "불러오는 중..."}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Info className="w-3.5 h-3.5 text-blue-500" />
                                            알림 발송 스케줄 안내 (총 6회 제공)
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                                            <div className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1 hover:border-blue-200 transition-colors">
                                                <span className="text-[10px] text-blue-600 block">📢 원서 접수 시작 알림</span>
                                                <ul className="space-y-1 text-gray-600">
                                                    <li className="flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                        시작 7일 전 사전 안내
                                                    </li>
                                                    <li className="flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                        시작 1일 전 리마인드
                                                    </li>
                                                    <li className="flex items-center gap-1.5 font-bold text-blue-600">
                                                        <Check className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                                        접수 시작 당일 (D-Day)
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1 hover:border-red-200 transition-colors">
                                                <span className="text-[10px] text-red-500 block">🚨 원서 접수 마감 알림</span>
                                                <ul className="space-y-1 text-gray-600">
                                                    <li className="flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                        마감 7일 전 임박 안내
                                                    </li>
                                                    <li className="flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                        마감 1일 전 최종 경고
                                                    </li>
                                                    <li className="flex items-center gap-1.5 font-bold text-red-600">
                                                        <Check className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                                                        접수 마감 당일 (D-Day)
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 모달 푸터 */}
                        <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-600 rounded-2xl transition-colors active:scale-98"
                            >
                                {selectedSchedule.isSubscribed ? "유지하기" : "취소"}
                            </button>
                            <button
                                onClick={() => handleConfirmNotification(selectedSchedule.id, selectedSchedule.isSubscribed)}
                                className={`flex-1 px-5 py-3.5 text-sm font-extrabold text-white rounded-2xl shadow-md transition-all hover:shadow active:scale-98 ${
                                    selectedSchedule.isSubscribed
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {selectedSchedule.isSubscribed ? "알림 취소하기" : "알림 신청하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
