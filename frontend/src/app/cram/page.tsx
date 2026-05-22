"use client";

import React, { useEffect, useState } from "react";
import { cramQuizzes, CramQuestion } from "@/data/cramQuizzes";
import { 
    BookOpen, 
    Award, 
    Sparkles, 
    Lightbulb, 
    CheckCircle, 
    XCircle, 
    ArrowRight, 
    ArrowLeft, 
    RefreshCw, 
    AlertCircle,
    ArrowDown,
    Zap,
    Bookmark
} from "lucide-react";

// Local storage key for cram quiz records
const CRAM_STORAGE_KEY = "hanneunggeom_cram_quiz_records";

const ERA_OPTIONS = [
    { id: "all", name: "전체 시대", count: 450 },
    { id: "prehistory", name: "선사 & 고조선", count: 50 },
    { id: "threeKingdoms", name: "삼국 & 가야", count: 50 },
    { id: "unifiedSilla", name: "통일신라 & 발해", count: 50 },
    { id: "goryeo", name: "고려", count: 50 },
    { id: "earlyJoseon", name: "조선전기", count: 50 },
    { id: "lateJoseon", name: "조선후기", count: 50 },
    { id: "portOpening", name: "개항기", count: 50 },
    { id: "japaneseColonial", name: "일제강점기", count: 50 },
    { id: "modern", name: "현대사", count: 50 }
];

const ERA_MAP: Record<string, string> = {
    "prehistory": "선사 & 고조선",
    "threeKingdoms": "삼국 & 가야",
    "unifiedSilla": "통일신라 & 발해",
    "goryeo": "고려",
    "earlyJoseon": "조선전기",
    "lateJoseon": "조선후기",
    "portOpening": "개항기",
    "japaneseColonial": "일제강점기",
    "modern": "현대사"
};

export default function CramPage() {
    const [activeTab, setActiveTab] = useState<"summary" | "quiz">("summary");
    
    // Starter configs
    const [selectedEra, setSelectedEra] = useState<string>("all");
    const [selectedCount, setSelectedCount] = useState<number>(20);
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    
    // Quiz state
    const [shuffledQuizzes, setShuffledQuizzes] = useState<CramQuestion[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    
    // localStorage records
    const [quizRecords, setQuizRecords] = useState<Record<string, "correct" | "wrong">>({});

    // Load records from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CRAM_STORAGE_KEY);
        if (stored) {
            try {
                setQuizRecords(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cram records", e);
            }
        }
    }, []);

    // Shuffle and start quiz helper
    const handleStartQuiz = () => {
        let filtered = [...cramQuizzes];
        if (selectedEra !== "all") {
            const eraValue = ERA_MAP[selectedEra];
            filtered = filtered.filter(q => q.era === eraValue);
        }
        
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        const sliced = shuffled.slice(0, selectedCount);
        
        setShuffledQuizzes(sliced);
        setCurrentQuizIndex(0);
        setSelectedAnswer(null);
        setIsEvaluated(false);
        setScore(0);
        setQuizFinished(false);
        setQuizStarted(true);
    };

    const handleAnswerSelect = (choiceIndex: number) => {
        if (isEvaluated) return;
        setSelectedAnswer(choiceIndex);
    };

    const handleEvaluate = () => {
        if (selectedAnswer === null) return;
        
        const currentQuestion = shuffledQuizzes[currentQuizIndex];
        const isCorrect = selectedAnswer === currentQuestion.answer;
        
        // Update score
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Update records in state & localStorage
        const status: "correct" | "wrong" = isCorrect ? "correct" : "wrong";
        const newRecords: Record<string, "correct" | "wrong"> = {
            ...quizRecords,
            [currentQuestion.id]: status
        };
        setQuizRecords(newRecords);
        localStorage.setItem(CRAM_STORAGE_KEY, JSON.stringify(newRecords));

        setIsEvaluated(true);
    };

    const handleNext = () => {
        if (currentQuizIndex < shuffledQuizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsEvaluated(false);
        } else {
            setQuizFinished(true);
        }
    };

    // Keyword categories for Tab 1
    const keywordCategories = [
        {
            title: "1. 선사 ~ 여러 나라의 성장",
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            iconColor: "text-blue-500",
            items: [
                { keyword: "신석기", desc: "빗살무늬 토기, 가락바퀴, 뼈바늘, 움집, 농경/목축 시작 (강가/해안가 거주)" },
                { keyword: "청동기", desc: "비파형 동검, 고인돌, 반달 돌칼, 미송리식 토기, 계급 출현 (★벼농사 시작)" },
                { keyword: "고조선", desc: "8조법 시행, 탁자식 고인돌과 비파형 동검의 분포로 세력 범위 파악" },
                { keyword: "부여", desc: "영고(12월 제천행사), 5부족 연맹체(마가·우가·저가·구가 사출도), 1책 12법" },
                { keyword: "고구려", desc: "동맹(10월 제천행사), 서옥제(데릴사위제), 부경이라는 약탈 창고 존재" },
                { keyword: "옥저", desc: "밑며느리제, 골장제(가족 공동 무덤), 해산물 풍부하나 왕이 없음" },
                { keyword: "동예", desc: "무천(10월 제천행사), 책화(경계 침범 시 배상), 족외혼, 단궁·과하마·반어피" },
                { keyword: "삼한", desc: "신지·읍차(정치 군장), 천군(종교 군장)과 소도 존재 (★제정 분리 사회), 벼농사 및 계루·두레 발달" }
            ]
        },
        {
            title: "2. 고대 (삼국 ~ 남북국 시대)",
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            iconColor: "text-indigo-500",
            items: [
                { keyword: "고구려", desc: "고국천왕(진대법-을파소 건의) → 관계토대왕(신라 침입 왜 격퇴, 호우명 그릇) → 장수왕(평양 천도, 남진 정책, 한강 점령, 중원고구려비 건립) → 살수대첩(을지문덕)" },
                { keyword: "백제", desc: "고이왕(율령 반포, 관등제) → 근초고왕(요서·산둥 진출, 석촌동 고분) → 무령왕(지방 22담로 왕족 파견, 벽돌무덤) → 성왕(사비 천도, 남부여 개칭, 관산성 전투 전사)" },
                { keyword: "신라", desc: "내물왕(마립간 칭호, 왜 격퇴) → 지증왕(우산국/독도 복속, 국호 '신라'·'왕' 사용, 동시전 설치) → 법흥왕(병부 설치, 율령 반포, 백관 공복, 불교 공인-이차돈 순교) → 진흥왕(화랑도 개편, 한강 점령, 순수비 건립)" },
                { keyword: "통일신라", desc: "신문왕(★왕권 강화, 국학 설치, 관료전 지급, 녹읍 폐지, 9주 5소경) → 경덕왕(불국사, 석굴암) → 신라 하대(원종·애노의 난, 최치원의 시무 10여 조 건의, 호족 세력 성장)" },
                { keyword: "발해", desc: "무왕(인안 연호, 당 산둥 공격) → 문왕(대흥 연호, 3성 6부 정비) → 선왕(★해동성국 칭호, 5경 15부 62주 영토 최대 확장)" }
            ]
        },
        {
            title: "3. 고려 시대",
            bg: "bg-teal-50/50",
            border: "border-teal-100",
            iconColor: "text-teal-500",
            items: [
                { keyword: "기틀 마련", desc: "태조 왕건(사심관·기인 제도, 훈요십조, 빈민구제 흑창) → 광종(★노비안검법, 과거제 실시, 백관 공복) → 성종(최승로의 시무 28조 수용, 12목 지방관 파견)" },
                { keyword: "거란 침입", desc: "1차 침입(서희의 외교 담판으로 강동 6주 획득) → 3차 침입(강감찬의 귀주대첩 승리, 나성 축조)" },
                { keyword: "여진 항쟁", desc: "윤관의 건의로 신기군·신보군·항마군의 별무반 조직 → 여진 정벌 후 동북 9성 개척" },
                { keyword: "몽골 침입", desc: "최씨 무신정권의 강화도 도읍 천도 → 김윤후의 처인성 전투 승리 → 삼별초의 항쟁(강화도 → 진도 → 제주도)" },
                { keyword: "홍건적/왜구", desc: "화포를 사용한 최무선의 진포대첩, 최영의 홍산대첩, 이성계의 황산대첩 → 신흥 무인 세력의 성장" },
                { keyword: "공민왕 개혁", desc: "반원 자주 정책(변발·호복 몽골풍 폐지, 정동행성 이문소 폐지, 쌍성총관부 무력 탈환), 신돈 등용 및 전민변정도감 설치로 권문세족 견제" }
            ]
        },
        {
            title: "4. 조선 시대",
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            iconColor: "text-amber-500",
            items: [
                { keyword: "조선 전기 국왕", desc: "태종(6조 직계제, 호패법 실시) → 세종(의정부 서사제, 집현전 육성, 북방 4군 6진 개척, 공법 연분9등/전분6등법) → 세조(6조 직계제 부활, 직전법 실시) → 성종(★경국대전 완성, 홍문관 설치)" },
                { keyword: "통치 체제 변동", desc: "양란(임진왜란·병자호란) 이후 최고 임시 기구였던 비변사가 최고 권력 기구화, 군사 체제는 5군영(훈련도감 중심) 및 지방 속오군 체제 개편" },
                { keyword: "대동법 실시", desc: "공납의 폐단을 막기 위해 특산물 대신 토지 결수 기준으로 쌀, 삼베, 동전으로 징수 → ★공인의 등장으로 상품 화폐 경제의 비약적 발달 초래" },
                { keyword: "영조의 탕평책", desc: "탕평채와 서원 정리, 군역 부담 완화를 위해 균역법(군포를 2필에서 1필로 경감) 시행, 부족 재정은 결작 및 선무군관포 징수" },
                { keyword: "정조의 개혁", desc: "친위 부대 장용영 창설, 규장각 활성화, 수원 화성 축조, 금난전권을 폐지하여 자유 상업을 보장한 신해통공 시행" }
            ]
        },
        {
            title: "5. 근대 (개항기 ~ 대한제국)",
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            iconColor: "text-rose-500",
            items: [
                { keyword: "흥선대원군", desc: "경복궁 중건(당백전 발행으로 물가 폭등), 서원 정리(47개소만 잔존) / 병인양요(양헌수 정족산성) → 신미양요(어재연 광성보) → 전국 척화비 건립" },
                { keyword: "임오군란 (1882)", desc: "구식 군대(무위영·장어영) 차별과 민씨 정권 부패에 반발 → 제물포 조약 체결로 일본군 경비병 서울 주둔 허용" },
                { keyword: "갑신정변 (1884)", desc: "김옥균 등 급진개화파 주도, 우정총국 개국 축하연을 틈타 거사, 14개조 개혁안(신분제 폐지 등) 발표했으나 3일천하로 실패" },
                { keyword: "동학농민운동 (1894)", desc: "고부 민란 봉기 → 황토현·황룡촌 전투 관군 격파 → 전주 화약 체결 및 자치 개혁 기구 집강소 설치 → 일본군의 경복궁 침입에 반발하여 남·북접 연합 의병 출병 → 우금치 전투 패배" },
                { keyword: "갑오개혁 (1894)", desc: "초정부적 회의 기구 군국기무처 중심, 신분제(공사 노비법) 폐지, 과거제 폐지, 은 본위 화폐 제도 도입" },
                { keyword: "독립협회 (1896)", desc: "서재필 주도, 만민공동회 및 관민공동회 개최, 자주 국권·자유 민권·자강 개혁 강조, 헌의 6조 채택하여 중추원 관제 개편을 통한 의회 설립 지향" },
                { keyword: "대한제국 (1897)", desc: "아관파천 후 환궁하여 황제 즉위 및 광무개혁 추진(구본신참 원칙, 대한국 국제 반포, 토지 조사를 통한 지계 발급)" }
            ]
        },
        {
            title: "6. 일제 강점기 (시기별 정책 구별)",
            bg: "bg-purple-50/50",
            border: "border-purple-100",
            iconColor: "text-purple-500",
            items: [
                { keyword: "1910년대 무단 통치", desc: "헌병 경찰 제도(경찰이 재판 없이 즉결 처분권 소유), 교사가 제복 착용 및 칼을 참, 회사령(허가제), 토지조사사업 시행으로 국유지 약탈 → 3·1 운동(1919)의 배경" },
                { keyword: "1920년대 문화 통치", desc: "보통 경찰 제도 전환(기만적 통치), 언론·출판 허용(동아·조선일보 창간되나 검열 심화), 회사령 신고제 전환, 산미증식계획(쌀 수탈)" },
                { keyword: "실력 양성 운동", desc: "조만식 주도의 물산장려운동('조선 사람 조선 것'), 민립대학 설립 운동 / 신간회(1927년 비타협 민족주의 + 사회주의 연대, 광주학생항일운동 지원)" },
                { keyword: "1930~40년대 민족말살", desc: "중일 전쟁 이후 본격화. 황국 신민 서사 암송, 신사 참배 및 궁성 요배 강요, 창씨개명, 조선어 교육 금지" },
                { keyword: "인적/물적 수탈", desc: "국가총동원법 제정(1938), 병참 기지화 정책, 징용·징병제 강제 동원, 공출제(금속·쌀 수탈), 위안부 강제 동원" }
            ]
        },
        {
            title: "7. 현대 사회 (민주화와 통일)",
            bg: "bg-slate-50/50",
            border: "border-slate-100",
            iconColor: "text-slate-500",
            items: [
                { keyword: "이승만 정부", desc: "농지개혁법 제정(경자유전 실현), 귀속재산 처리법 / 3·15 부정선거에 분노하여 김주열 열사의 죽음을 계기로 4·19 혁명(1960) 발발, 이승만 대통령 하야" },
                { keyword: "박정희 정부", desc: "5·16 군사 정변 집권, 한일 협정 체결(6·3 시위), 베트남 파병, 7·4 남북 공동 성명 발표, 10월 유신 선포(1972, 장기 독재), YH 무역 사건 및 부마 민주 항쟁 발생, 10·26 사태로 서거" },
                { keyword: "전두환 정부", desc: "12·12 군사 반란 집권, 5·18 민주화 운동(광주) 무력 유혈 진압 / 박종철·이한열 열사의 희생과 4·13 호헌 조치 반발로 6월 민주 항쟁(1987) 발발 → 대통령 직선제(5년 단임) 개헌 도출" },
                { keyword: "남북 합의서", desc: "박정희(7·4 남북 공동 성명: 자주·평화·민족대단결) → 노태우(남북 기본 합의서 채택, UN 동시 가입) → 김대중(★최초 남북정상회담 개최 및 6·15 남북 공동 선언 발표, 개성공단 합의)" }
            ]
        }
    ];

    const currentQuestion = shuffledQuizzes[currentQuizIndex];
    const userPreviousRecord = currentQuestion ? quizRecords[currentQuestion.id] : null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
            {/* Header Title */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-toss-blue/10 text-toss-blue px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    벼락치기 초고효율 코너 (D-1)
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-toss-gray900">
                    단 하루로 합격 확률 극대화하기
                </h1>
                <p className="text-toss-gray600 text-sm font-medium">
                    세부 개념을 걷어낸 정답 키워드 요약과 핵심 기출 20선으로 마무리하세요.
                </p>
            </div>

            {/* Learning Support Callout Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-toss-blue/20 p-6 rounded-toss flex items-start gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-toss-blue shadow-sm flex-shrink-0">
                    <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                    <h3 className="font-bold text-toss-gray900 text-sm md:text-base">
                        수험생 여러분을 위한 따뜻한 응원의 한마디 💙
                    </h3>
                    <p className="text-toss-gray600 text-xs md:text-sm leading-relaxed font-medium">
                        벼락치기는 시험 직전 점수를 보완하는 든든한 날개가 되어주지만, 완벽한 합격 보장을 위해서는 차근차근 역사의 흐름을 익혀가는 것이 최고의 열쇠입니다. 이번 시험을 멋진 디딤돌 삼아 꾸준히 공부해 나가는 계기가 되길 바랄게요. 남은 하루 동안 후회 없이 몰입할 수 있도록 <strong>&apos;ㅎㄴㄱ&apos;</strong>가 마지막 순간까지 든든하게 응원하겠습니다. 힘내세요!
                    </p>
                </div>
            </div>

            {/* Tab Controller */}
            <div className="flex border-b border-toss-gray200 p-1 bg-toss-gray100 rounded-2xl max-w-md mx-auto">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "summary"
                            ? "bg-white text-toss-blue shadow"
                            : "text-toss-gray600 hover:text-toss-gray900"
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    초고효율 요약본
                </button>
                <button
                    onClick={() => {
                        setActiveTab("quiz");
                        setQuizStarted(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "quiz"
                            ? "bg-white text-toss-blue shadow"
                            : "text-toss-gray600 hover:text-toss-gray900"
                    }`}
                >
                    <Award className="w-4 h-4" />
                    벼락치기 퀴즈
                </button>
            </div>

            {/* TAB 1: SUMMARY CONTENT */}
            {activeTab === "summary" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    
                    {/* Visual Timeline Section */}
                    <div className="bg-white p-6 md:p-8 rounded-toss border border-toss-gray200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-xl font-bold text-toss-gray900">🕒 한눈에 파악하는 시대별 핵심 타임라인</h2>
                        </div>
                        <p className="text-xs text-toss-gray600 font-medium">
                            한능검의 킬러 유형인 &apos;시대적 순서&apos;를 맞히는 핵심 로드맵입니다. 머릿속에 이 흐름을 사진 찍듯 박제해 두세요.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            {/* 고대 삼국 */}
                            <div className="bg-gradient-to-b from-blue-50/30 to-white p-5 rounded-2xl border border-toss-gray200 flex flex-col items-center text-center space-y-4">
                                <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">고대 삼국 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-toss-gray800">
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">태조왕·고이왕 <span className="text-[10px] text-toss-blue block mt-0.5">(중앙집권 기반 형성)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-blue-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm border-blue-200">광개토·장수왕 <span className="text-[10px] text-toss-blue block mt-0.5">(5세기 고구려 전성기 & 남진)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-blue-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">근초고왕 <span className="text-[10px] text-toss-blue block mt-0.5">(백제 요서 진출 & 석촌동 고분)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-blue-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">진흥왕 <span className="text-[10px] text-toss-blue block mt-0.5">(6세기 신라 한강 차지 & 순수비)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-blue-300" />
                                    <div className="bg-blue-600 text-white p-2.5 rounded-xl border shadow-sm">무열·문무왕 <span className="text-[10px] text-blue-100 block mt-0.5">(삼국 통일 달성, 676년)</span></div>
                                </div>
                            </div>

                            {/* 고려 시대 */}
                            <div className="bg-gradient-to-b from-teal-50/30 to-white p-5 rounded-2xl border border-toss-gray200 flex flex-col items-center text-center space-y-4">
                                <span className="bg-teal-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">고려 시대 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-toss-gray800">
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">태조 왕건 <span className="text-[10px] text-teal-600 block mt-0.5">(국가 통합, 기인·사심관제)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm border-teal-200">광종 <span className="text-[10px] text-teal-600 block mt-0.5">(★노비안검법 & 과거제 실시)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">성종 <span className="text-[10px] text-teal-600 block mt-0.5">(시무 28조 반영, 12목 파견)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 shadow-sm text-left">
                                        <div className="font-extrabold text-center text-teal-800 border-b border-teal-200 pb-1 mb-1">외침 수난 연대기</div>
                                        <div className="space-y-1 text-[10px] text-toss-gray600">
                                            <div>1. 거란: 서희 강동6주 → 강감찬 귀주</div>
                                            <div>2. 여진: 윤관 별무반 → 동북9성</div>
                                            <div>3. 몽골: 강화 천도 → 김윤후 처인성</div>
                                            <div>4. 왜구: 최무선 화포 → 황산·홍산대첩</div>
                                        </div>
                                    </div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-teal-600 text-white p-2.5 rounded-xl border shadow-sm">공민왕 <span className="text-[10px] text-teal-100 block mt-0.5">(반원 자주, 쌍성총관부 수복)</span></div>
                                </div>
                            </div>

                            {/* 조선 시대 */}
                            <div className="bg-gradient-to-b from-amber-50/30 to-white p-5 rounded-2xl border border-toss-gray200 flex flex-col items-center text-center space-y-4">
                                <span className="bg-amber-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">조선 시대 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-toss-gray800">
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">태조·태종 <span className="text-[10px] text-amber-600 block mt-0.5">(조선 개국, 6조 직계제)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm border-amber-200">세종대왕 <span className="text-[10px] text-amber-600 block mt-0.5">(훈민정음, 4군 6진, 공법)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">성종 <span className="text-[10px] text-amber-600 block mt-0.5">(★경국대전 최종 반포)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 shadow-sm text-left">
                                        <div className="font-extrabold text-center text-amber-800 border-b border-amber-200 pb-1 mb-1">양란 발생 및 체제 개편</div>
                                        <div className="space-y-1 text-[10px] text-toss-gray600">
                                            <div>- 왜란·호란 경과 후 비변사 세력 독점</div>
                                            <div>- 대동법 실시(공인 등장, 대유행)</div>
                                            <div>- 훈련도감 중심의 5군영 정비</div>
                                        </div>
                                    </div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-amber-600 text-white p-2.5 rounded-xl border shadow-sm">영조·정조 <span className="text-[10px] text-amber-100 block mt-0.5">(균역법, 신해통공, 탕평정치)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Key Facts Packs */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-toss-gray900 flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-toss-blue" />
                            🔑 시대별 정답 키워드 팩 (Top 3 필수 암기)
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {keywordCategories.map((cat, idx) => (
                                <div key={idx} className={`p-6 rounded-toss border ${cat.border} ${cat.bg} shadow-sm space-y-4 hover:shadow-md transition-all duration-300`}>
                                    <h3 className="font-extrabold text-lg text-toss-gray900 border-b pb-2 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cat.iconColor} bg-current`} />
                                        {cat.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="bg-white p-3.5 rounded-xl border border-toss-gray200/50 space-y-1.5 shadow-sm hover:border-toss-blue/30 transition-colors">
                                                <span className={`inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-toss-gray100 ${cat.iconColor}`}>
                                                    {item.keyword}
                                                </span>
                                                <p className="text-xs text-toss-gray800 font-medium leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Button to Quiz */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => {
                                setActiveTab("quiz");
                                setQuizStarted(false);
                            }}
                            className="inline-flex items-center gap-2 bg-toss-blue text-white font-bold px-8 py-4 rounded-xl hover:bg-toss-blueHover shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
                        >
                            <Zap className="w-4 h-4" />
                            벼락치기 퀴즈 풀러가기
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            )}

            {/* TAB 2: CRAM QUIZ CONTENT */}
            {activeTab === "quiz" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {!quizStarted ? (
                        /* Quiz Starter Config UI */
                        <div className="bg-white p-6 md:p-8 rounded-toss border border-toss-gray200/60 shadow-md space-y-8 max-w-2xl mx-auto">
                            <div className="border-b pb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-toss-blue animate-pulse" />
                                <div>
                                    <h2 className="text-xl font-bold text-toss-gray900">벼락치기 맞춤 학습 설정</h2>
                                    <p className="text-xs text-toss-gray500 mt-0.5">
                                        원하는 시대 범위와 문항 수를 선택하고 지금 바로 퀴즈를 풀며 정답을 각인해 보세요.
                                    </p>
                                </div>
                            </div>

                            {/* Section 1: Era Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-toss-gray800 block">
                                    1. 학습할 시대 선택
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-2">
                                    {ERA_OPTIONS.map((opt) => {
                                        const isSelected = selectedEra === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedEra(opt.id)}
                                                className={`text-left p-3.5 border rounded-xl transition-all relative flex flex-col justify-between h-20 hover:border-toss-blue/40 ${
                                                    isSelected
                                                        ? "border-toss-blue bg-blue-50/30 ring-1 ring-toss-blue/20"
                                                        : "border-toss-gray200 bg-white"
                                                }`}
                                            >
                                                <span className={`text-xs md:text-sm font-bold ${
                                                    isSelected ? "text-toss-blue" : "text-toss-gray800"
                                                }`}>
                                                    {opt.name}
                                                </span>
                                                <span className="text-[10px] font-semibold text-toss-gray400 self-end">
                                                    준비 완료 ({opt.count}문항)
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-toss-blue" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 2: Question Count Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-toss-gray800 block">
                                    2. 풀고 싶은 문제 수 선택
                                </label>
                                <div className="flex border border-toss-gray200 p-1 bg-toss-gray100 rounded-xl max-w-sm">
                                    {[10, 20, 50].map((count) => {
                                        const isSelected = selectedCount === count;
                                        return (
                                            <button
                                                key={count}
                                                onClick={() => setSelectedCount(count)}
                                                className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                                                    isSelected
                                                        ? "bg-white text-toss-blue shadow-sm"
                                                        : "text-toss-gray600 hover:text-toss-gray900"
                                                }`}
                                            >
                                                {count}문항
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Instructions info */}
                            <div className="bg-toss-gray50 p-4 rounded-xl border border-toss-gray200/50 text-[11px] text-toss-gray500 leading-relaxed font-semibold">
                                • 역사적 철저 검증을 거친 실제 한국사능력검정시험의 고품질 기출 변형 문제입니다.<br />
                                • 문제를 푸는 즉시 상세 해설을 볼 수 있으며, 과거 풀이 기록이 있을 경우 오답 이력이 표시됩니다.
                            </div>

                            {/* Starter Button */}
                            <button
                                onClick={handleStartQuiz}
                                className="w-full py-4 bg-toss-blue hover:bg-toss-blueHover text-white font-extrabold text-sm md:text-base rounded-xl transition-all shadow-sm hover:shadow-md transform active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                퀴즈 시작하기
                            </button>
                        </div>
                    ) : quizFinished ? (
                        /* Result Summary View */
                        <div className="bg-white p-8 md:p-12 rounded-toss border border-toss-gray200/60 shadow-lg text-center space-y-6 max-w-xl mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-toss-blue/10 text-toss-blue mb-2">
                                <Award className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-toss-gray900">학습을 완료했습니다! 🎉</h2>
                                <p className="text-toss-gray600 text-sm font-medium">
                                    [{ERA_OPTIONS.find(o => o.id === selectedEra)?.name}] 영역의 퀴즈 세션 결과입니다.
                                </p>
                            </div>

                            {/* Final Score Board */}
                            <div className="bg-toss-gray100 p-6 rounded-2xl border flex flex-col justify-center items-center gap-1.5 max-w-xs mx-auto">
                                <span className="text-xs font-bold text-toss-gray600">나의 최종 점수</span>
                                <div className="text-3xl font-black text-toss-blue">
                                    {score} <span className="text-lg font-bold text-toss-gray800">/ {shuffledQuizzes.length} 문항</span>
                                </div>
                                <span className="text-[10px] font-semibold text-toss-gray500 mt-1">
                                    (정답률 {shuffledQuizzes.length > 0 ? Math.round((score / shuffledQuizzes.length) * 100) : 0}%)
                                </span>
                            </div>

                            <div className="text-xs text-toss-gray500 leading-relaxed font-semibold">
                                틀린 문제는 요약 탭의 키워드를 다시 읽어 완벽히 숙지해 보세요.<br />
                                아래 버튼을 눌러 동일 조건을 다시 풀거나, 다른 조건을 설정할 수 있습니다.
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                                <button
                                    onClick={() => setQuizStarted(false)}
                                    className="px-5 py-3 rounded-xl border font-bold text-toss-gray800 hover:bg-toss-gray100 text-xs transition-all active:scale-95"
                                >
                                    다른 조건 설정하기
                                </button>
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-6 py-3 rounded-xl bg-toss-blue text-white font-bold hover:bg-toss-blueHover text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    이 조건으로 다시 풀기
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Standard Quiz Question View */
                        <div className="space-y-6">
                            
                            {/* Quiz Header & Progress Bar */}
                            <div className="bg-white p-5 rounded-toss border border-toss-gray200/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                    <span className="font-extrabold text-toss-gray800 text-sm whitespace-nowrap">
                                        진행 상황 ({currentQuizIndex + 1} / {shuffledQuizzes.length})
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (confirm("퀴즈 풀이를 중단하고 설정 화면으로 돌아가시겠습니까?")) {
                                                setQuizStarted(false);
                                            }
                                        }}
                                        className="text-xs font-bold text-toss-gray500 hover:text-toss-gray900 transition-colors flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        중단 및 설정 변경
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-2/3">
                                    <div className="w-full bg-toss-gray200 rounded-full h-2.5">
                                        <div 
                                            className="bg-toss-blue h-2.5 rounded-full transition-all duration-300" 
                                            style={{ width: `${shuffledQuizzes.length > 0 ? ((currentQuizIndex + 1) / shuffledQuizzes.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-toss-gray600 whitespace-nowrap">
                                        {shuffledQuizzes.length > 0 ? Math.round(((currentQuizIndex + 1) / shuffledQuizzes.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>

                            {/* Question Container Card */}
                            <div className="bg-white p-6 md:p-8 rounded-toss border border-toss-gray200/60 shadow-sm space-y-6">
                                
                                {/* Badge Zone: Personal History Tag */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-toss-blue/10 text-toss-blue text-[10px] px-2.5 py-1 rounded-md font-bold">
                                            {shuffledQuizzes[currentQuizIndex]?.era}
                                        </span>
                                        <span className="bg-toss-gray100 text-toss-gray600 text-[10px] px-2.5 py-1 rounded-md font-bold">
                                            {shuffledQuizzes[currentQuizIndex]?.topic}
                                        </span>
                                    </div>
                                    
                                    {/* Personal Answer History */}
                                    {shuffledQuizzes[currentQuizIndex] && quizRecords[shuffledQuizzes[currentQuizIndex].id] && (
                                        <div className="flex-shrink-0 animate-in fade-in zoom-in-95">
                                            {quizRecords[shuffledQuizzes[currentQuizIndex].id] === "correct" ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full">
                                                    <CheckCircle className="w-3.5 h-3.5" /> ✓ 지난 번에 맞혔던 문제에요
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full">
                                                    <XCircle className="w-3.5 h-3.5" /> ✗ 지난 번에 틀렸던 문제에요
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Problem Content */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-toss-blue text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                                            {currentQuizIndex + 1}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-base md:text-lg font-bold text-toss-gray900 whitespace-pre-wrap leading-relaxed">
                                                {shuffledQuizzes[currentQuizIndex]?.contentText}
                                            </h3>
                                            {shuffledQuizzes[currentQuizIndex]?.imagePath && (
                                                <div className="mt-3 flex justify-center bg-toss-gray50 p-4 rounded-2xl border border-toss-gray200/50 max-w-sm mx-auto shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={shuffledQuizzes[currentQuizIndex].imagePath}
                                                        alt="유물 및 자료 이미지"
                                                        className="max-h-52 object-contain rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Choices */}
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    {shuffledQuizzes[currentQuizIndex]?.choices.map((choice, i) => {
                                        const choiceNum = i + 1;
                                        const isSelected = selectedAnswer === choiceNum;
                                        
                                        let btnStyle = "border-toss-gray200 hover:bg-toss-gray100/50 text-toss-gray800";
                                        
                                        if (isSelected) {
                                            btnStyle = "border-toss-blue bg-blue-50/50 text-toss-blueHover font-semibold ring-1 ring-toss-blue/20";
                                        }

                                        if (isEvaluated) {
                                            if (choiceNum === shuffledQuizzes[currentQuizIndex]?.answer) {
                                                // Correct answer highlight
                                                btnStyle = "border-green-500 bg-green-50 text-green-700 font-bold border-2";
                                            } else if (isSelected && choiceNum !== shuffledQuizzes[currentQuizIndex]?.answer) {
                                                // Wrong selected choice
                                                btnStyle = "border-red-400 bg-red-50 text-red-600 line-through decoration-red-300 font-semibold border-2";
                                            } else {
                                                // Dim other choices
                                                btnStyle = "border-toss-gray100 text-toss-gray300 bg-toss-gray50/30 opacity-50 cursor-not-allowed";
                                            }
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswerSelect(choiceNum)}
                                                disabled={isEvaluated}
                                                className={`w-full text-left px-5 py-4 border rounded-2xl flex items-center gap-3 transition-all ${btnStyle}`}
                                            >
                                                <div 
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors
                                                        ${isSelected ? "border-toss-blue text-toss-blue" : "border-toss-gray300 text-toss-gray500"}
                                                        ${isEvaluated && choiceNum === shuffledQuizzes[currentQuizIndex]?.answer ? "border-green-600 bg-green-600 text-white" : ""}
                                                        ${isEvaluated && isSelected && choiceNum !== shuffledQuizzes[currentQuizIndex]?.answer ? "border-red-600 bg-red-600 text-white" : ""}
                                                    `}
                                                >
                                                    {choiceNum}
                                                </div>
                                                <span className="text-xs md:text-sm flex-1 leading-relaxed">{choice}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-toss-gray100">
                                    <div className="text-xs font-semibold text-toss-gray500">
                                        * 정답 제출 시 최근 학습 이력이 자동 기록됩니다.
                                    </div>
                                    
                                    {!isEvaluated ? (
                                        <button
                                            onClick={handleEvaluate}
                                            disabled={selectedAnswer === null}
                                            className="px-6 py-3 rounded-xl font-extrabold text-xs shadow-sm transition-all transform active:scale-95 flex items-center gap-1
                                                disabled:bg-toss-gray200 disabled:text-toss-gray500 disabled:cursor-not-allowed disabled:transform-none
                                                bg-toss-blue hover:bg-toss-blueHover text-white"
                                        >
                                            정답 확인
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            className="px-6 py-3 rounded-xl bg-toss-gray800 hover:bg-toss-gray900 text-white font-extrabold text-xs shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5"
                                        >
                                            {currentQuizIndex < shuffledQuizzes.length - 1 ? (
                                                <>
                                                    다음 문제
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </>
                                            ) : (
                                                <>
                                                    최종 채점 결과 확인
                                                    <Award className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                            </div>

                            {/* Commentary Explanations */}
                            {isEvaluated && (
                                <div className="bg-white p-6 rounded-toss border border-toss-gray200/60 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 border-b pb-3 text-toss-gray900">
                                        <AlertCircle className="w-5 h-5 text-toss-blue" />
                                        <h4 className="font-extrabold text-sm md:text-base">💡 정답 해설 및 핵심 개념 체크</h4>
                                    </div>

                                    <div className="space-y-3 text-xs md:text-sm">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span>실전 정답:</span>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-extrabold">
                                                {shuffledQuizzes[currentQuizIndex]?.answer}번
                                            </span>
                                            {selectedAnswer === shuffledQuizzes[currentQuizIndex]?.answer ? (
                                                <span className="text-green-600 text-xs font-bold">(맞혔습니다! 🥳)</span>
                                            ) : (
                                                <span className="text-red-500 text-xs font-bold">(틀렸습니다. 다시 기억해 두세요!)</span>
                                            )}
                                        </div>

                                        <div className="bg-toss-gray50 p-4 rounded-xl border border-toss-gray200/40 text-toss-gray700 leading-relaxed text-xs">
                                            {shuffledQuizzes[currentQuizIndex]?.explanation}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
