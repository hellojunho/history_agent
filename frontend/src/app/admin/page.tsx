"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [selectedTable, setSelectedTable] = useState<string>("user");
    const [tableData, setTableData] = useState<any[]>([]);
    
    const [questionFile, setQuestionFile] = useState<File | null>(null);
    const [answerFile, setAnswerFile] = useState<File | null>(null);
    const [isUploadingQ, setIsUploadingQ] = useState(false);
    const [isUploadingA, setIsUploadingA] = useState(false);

    // New User creation states
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState<string>("general");
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Chart toggles & interaction states
    const [showChart, setShowChart] = useState<boolean>(false);
    const [hoveredBar, setHoveredBar] = useState<{
        period: string;
        metricLabel: string;
        value: number;
        x: number;
        y: number;
    } | null>(null);

    const fetchStats = async () => {
        try {
            const data = await apiRequest<any>("/api/admin/stats");
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTableData = async (tableName: string) => {
        try {
            const data = await apiRequest<any[]>(`/api/admin/tables/${tableName}`);
            setTableData(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchTableData(selectedTable);
    }, [selectedTable]);

    const handleUploadQuestions = async () => {
        if (!questionFile) {
            alert("업로드할 문제 PDF 파일을 선택해주세요.");
            return;
        }
        setIsUploadingQ(true);
        try {
            const formData = new FormData();
            formData.append("file", questionFile);

            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:20000"}/api/admin/upload/questions`, {
                method: "POST",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "업로드 실패");

            alert(`성공적으로 업로드되었습니다!\n회차: ${result.round}회\n파일명: ${result.fileName}\n백그라운드 파싱 동작 여부: ${result.parserTriggered ? "트리거됨(문제/답지 모두 존재)" : "대기(상대 파일이 아직 없음)"}`);
            setQuestionFile(null);
            fetchTableData(selectedTable);
        } catch (error: any) {
            alert(error.message || "업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploadingQ(false);
        }
    };

    const handleUploadAnswers = async () => {
        if (!answerFile) {
            alert("업로드할 정답 PDF 파일을 선택해주세요.");
            return;
        }
        setIsUploadingA(true);
        try {
            const formData = new FormData();
            formData.append("file", answerFile);

            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:20000"}/api/admin/upload/answers`, {
                method: "POST",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "업로드 실패");

            alert(`성공적으로 업로드되었습니다!\n회차: ${result.round}회\n파일명: ${result.fileName}\n백그라운드 파싱 동작 여부: ${result.parserTriggered ? "트리거됨(문제/답지 모두 존재)" : "대기(상대 파일이 아직 없음)"}`);
            setAnswerFile(null);
            fetchTableData(selectedTable);
        } catch (error: any) {
            alert(error.message || "업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploadingA(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword) {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        setIsCreatingUser(true);
        try {
            await apiRequest("/api/admin/tables/user", {
                method: "POST",
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole
                })
            });
            alert("사용자가 성공적으로 생성되었습니다.");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserRole("general");
            fetchTableData("user");
        } catch (error: any) {
            alert(error.message || "사용자 생성에 실패했습니다.");
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await apiRequest(`/api/admin/tables/${selectedTable}/${id}`, { method: "DELETE" });
            alert("삭제되었습니다.");
            fetchTableData(selectedTable);
        } catch (error) {
            alert("삭제 실패");
        }
    };

    // Calculate dynamic SVG parameters
    const periods = ["1 day", "1 week", "1 month", "All time"];
    const metrics = [
        { key: "totalUsers", label: "전체 사용자", gradient: "totalGrad", color: "#3b82f6" },
        { key: "newUsers", label: "신규 가입", gradient: "newGrad", color: "#10b981" },
        { key: "loginCount", label: "로그인 수", gradient: "loginGrad", color: "#8b5cf6" },
        { key: "withdrawnUsers", label: "탈퇴 사용자", gradient: "withdrawnGrad", color: "#f97316" }
    ];

    const getMaxValue = () => {
        if (!stats) return 10;
        const vals = periods.flatMap(p => 
            metrics.map(m => stats[p]?.[m.key] || 0)
        );
        const max = Math.max(...vals);
        return max > 0 ? max : 10;
    };

    const maxValue = getMaxValue();
    const chartHeight = 250;
    const chartWidth = 680;
    const yPadding = 40;
    const xPadding = 70;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">관리자 대시보드</h1>
 
            {/* Statistics Section */}
            <section className="bg-white p-6 rounded shadow border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                        사용자 통계
                    </h2>
                    
                    {/* Premium Toggle Switch */}
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                        <span className="text-xs font-medium text-gray-600">그래프 시각화</span>
                        <button
                            onClick={() => setShowChart(!showChart)}
                            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${showChart ? "bg-indigo-600" : "bg-gray-300"}`}
                        >
                            <span
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${showChart ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Smooth Chart Visualization Area */}
                {showChart && stats && (
                    <div className="flex flex-col items-center justify-center mb-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-gray-100 shadow-sm relative overflow-visible transition-all duration-500 animate-fadeIn">
                        
                        {/* SVG Grouped Bar Chart */}
                        <svg viewBox="0 0 800 360" className="w-full max-w-4xl h-auto overflow-visible select-none">
                            <defs>
                                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#7c3aed" />
                                </linearGradient>
                                <linearGradient id="withdrawnGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fb923c" />
                                    <stop offset="100%" stopColor="#ea580c" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const yPos = yPadding + chartHeight * (1 - ratio);
                                const gridValue = Math.round(maxValue * ratio);
                                return (
                                    <g key={idx} className="opacity-40">
                                        <line 
                                            x1={xPadding} 
                                            y1={yPos} 
                                            x2={xPadding + chartWidth} 
                                            y2={yPos} 
                                            stroke="#e2e8f0" 
                                            strokeDasharray="4 4"
                                            strokeWidth="1"
                                        />
                                        <text 
                                            x={xPadding - 12} 
                                            y={yPos + 4} 
                                            textAnchor="end" 
                                            className="fill-gray-400 text-[11px] font-medium"
                                        >
                                            {gridValue.toLocaleString()}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Bars & Labels */}
                            {periods.map((period, pIdx) => {
                                const sectionWidth = chartWidth / periods.length;
                                const groupWidth = 4 * 22; // 4 metrics * 22px width
                                const sectionStart = xPadding + pIdx * sectionWidth;
                                const groupStart = sectionStart + (sectionWidth - groupWidth) / 2;

                                return (
                                    <g key={period}>
                                        {/* X-axis Label */}
                                        <text 
                                            x={sectionStart + sectionWidth / 2} 
                                            y={yPadding + chartHeight + 25} 
                                            textAnchor="middle" 
                                            className="fill-gray-600 text-xs font-semibold"
                                        >
                                            {period}
                                        </text>

                                        {/* Bars */}
                                        {metrics.map((m, mIdx) => {
                                            const val = stats[period]?.[m.key] || 0;
                                            const barH = (val / maxValue) * chartHeight;
                                            const barW = 16;
                                            const barX = groupStart + mIdx * 22;
                                            const barY = yPadding + chartHeight - barH;

                                            return (
                                                <rect
                                                    key={m.key}
                                                    x={barX}
                                                    y={barY}
                                                    width={barW}
                                                    height={Math.max(barH, 3)} // Show tiny sliver if 0 for visibility on hover
                                                    rx="3"
                                                    ry="3"
                                                    fill={`url(#${m.gradient})`}
                                                    className="transition-all duration-300 cursor-pointer hover:brightness-110"
                                                    onMouseEnter={() => {
                                                        setHoveredBar({
                                                            period,
                                                            metricLabel: m.label,
                                                            value: val,
                                                            x: barX + barW / 2,
                                                            y: barY
                                                        });
                                                    }}
                                                    onMouseLeave={() => setHoveredBar(null)}
                                                />
                                            );
                                        })}
                                    </g>
                                );
                            })}

                            {/* X & Y Axis Line */}
                            <line 
                                x1={xPadding} 
                                y1={yPadding + chartHeight} 
                                x2={xPadding + chartWidth} 
                                y2={yPadding + chartHeight} 
                                stroke="#cbd5e1" 
                                strokeWidth="1.5"
                            />
                            <line 
                                x1={xPadding} 
                                y1={yPadding} 
                                x2={xPadding} 
                                y2={yPadding + chartHeight} 
                                stroke="#cbd5e1" 
                                strokeWidth="1.5"
                            />

                            {/* Interactive Tooltip inside SVG */}
                            {hoveredBar && (
                                <g 
                                    transform={`translate(${hoveredBar.x}, ${hoveredBar.y - 12})`}
                                    className="pointer-events-none transition-all duration-200"
                                >
                                    {/* Glassmorphic Shadow Rect */}
                                    <rect 
                                        x="-60" 
                                        y="-50" 
                                        width="120" 
                                        height="48" 
                                        rx="6" 
                                        fill="#1f2937" 
                                        opacity="0.95"
                                        className="filter drop-shadow-lg"
                                    />
                                    {/* Small arrow */}
                                    <polygon 
                                        points="-6,-2 6,-2 0,3" 
                                        fill="#1f2937" 
                                        opacity="0.95"
                                    />
                                    {/* Text values */}
                                    <text 
                                        x="0" 
                                        y="-34" 
                                        textAnchor="middle" 
                                        className="fill-gray-300 text-[10px] font-semibold"
                                    >
                                        {hoveredBar.period} • {hoveredBar.metricLabel}
                                    </text>
                                    <text 
                                        x="0" 
                                        y="-15" 
                                        textAnchor="middle" 
                                        className="fill-indigo-300 text-xs font-extrabold"
                                    >
                                        {hoveredBar.value.toLocaleString()} 명/회
                                    </text>
                                </g>
                            )}
                        </svg>

                        {/* Chart Legends */}
                        <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-gray-100 w-full max-w-lg">
                            {metrics.map(m => (
                                <div key={m.key} className="flex items-center space-x-2">
                                    <span 
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: m.color }}
                                    />
                                    <span className="text-xs font-semibold text-gray-600">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3 font-medium">Period</th>
                                    <th className="p-3 font-medium text-right">Total users</th>
                                    <th className="p-3 font-medium text-right">New users</th>
                                    <th className="p-3 font-medium text-right">Login count</th>
                                    <th className="p-3 font-medium text-right">Withdrawn users</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["1 day", "1 week", "1 month", "All time"].map(period => (
                                    <tr key={period} className="border-b">
                                        <td className="p-3">{period}</td>
                                        <td className="p-3 text-right">{stats[period]?.totalUsers || 0}</td>
                                        <td className="p-3 text-right">{stats[period]?.newUsers || 0}</td>
                                        <td className="p-3 text-right">{stats[period]?.loginCount || 0}</td>
                                        <td className="p-3 text-right">{stats[period]?.withdrawnUsers || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>로딩 중...</p>
                )}
            </section>

            <section className="bg-white p-6 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">데이터베이스 관리</h2>
                <div className="mb-4">
                    <label className="font-medium mr-2">테이블 선택:</label>
                    <select 
                        value={selectedTable} 
                        onChange={e => setSelectedTable(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="user">User</option>
                        <option value="exam">Exam</option>
                        <option value="question">Question</option>
                        <option value="userexamresult">UserExamResult</option>
                        <option value="useranswer">UserAnswer</option>
                        <option value="material">Material</option>
                    </select>
                </div>
                
                {/* User Creation Form (Only when 'user' table is selected) */}
                {selectedTable === "user" && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200/60 max-w-xl">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                            신규 사용자 추가
                        </h3>
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">이메일 주소</label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full border p-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">비밀번호</label>
                                <input
                                    type="password"
                                    placeholder="최소 4자"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full border p-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">역할</label>
                                    <select
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                        className="w-full border p-2 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                                    >
                                        <option value="general">일반 사용자</option>
                                        <option value="admin">관리자</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreatingUser}
                                    className={`px-4 py-2 text-xs font-bold text-white rounded bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all self-end ${isCreatingUser ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isCreatingUser ? "생성 중..." : "추가"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                {tableData.length > 0 ? (
                                    Object.keys(tableData[0]).map(key => (
                                        <th key={key} className="p-2">{key}</th>
                                    ))
                                ) : <th className="p-2">데이터가 없습니다.</th>}
                                {tableData.length > 0 && <th className="p-2">액션</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    {Object.entries(row).map(([k, v]) => (
                                        <td key={k} className="p-2 truncate max-w-xs">
                                            {k === 'passwordHash' ? '********' : String(v)}
                                        </td>
                                    ))}
                                    <td className="p-2">
                                        <button 
                                            onClick={() => handleDeleteRecord(row.id)}
                                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-500 rounded"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* File Upload Forms */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Questions PDF Upload */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                        기출문제 PDF 업로드
                    </h2>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                            {questionFile ? questionFile.name : "문제 PDF 파일을 드래그하거나 클릭하여 선택하세요."}
                        </span>
                        <span className="text-xs text-gray-400">PDF 파일만 지원 (파일명 형식: 예: 77회_문제.pdf)</span>
                    </div>
                    <button 
                        onClick={handleUploadQuestions}
                        disabled={isUploadingQ}
                        className={`w-full py-3 text-white rounded-lg font-semibold transition-colors shadow-sm ${isUploadingQ ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isUploadingQ ? "업로드 중..." : "문제 PDF 업로드"}
                    </button>
                </div>

                {/* Answers PDF Upload */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col space-y-5">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                        정답/해설 PDF 업로드
                    </h2>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                            {answerFile ? answerFile.name : "답지 PDF 파일을 드래그하거나 클릭하여 선택하세요."}
                        </span>
                        <span className="text-xs text-gray-400">PDF 파일만 지원 (파일명 형식: 예: 77회_답지.pdf)</span>
                    </div>
                    <button 
                        onClick={handleUploadAnswers}
                        disabled={isUploadingA}
                        className={`w-full py-3 text-white rounded-lg font-semibold transition-colors shadow-sm ${isUploadingA ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isUploadingA ? "업로드 중..." : "정답 PDF 업로드"}
                    </button>
                </div>
            </section>
        </div>
    );
}
