"use client";

import React, { useEffect, useState } from "react";
import { cramQuizzes, CramQuestion } from "@/data/cramQuizzes";
import { ERA_KINGS } from "@/data/cram/kings";
import { ERA_EVENTS } from "@/data/cram/events";
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
    Bookmark,
    Crown,
    Film,
    User,
    Calendar,
    Compass
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
    const [activeTab, setActiveTab] = useState<"summary" | "kings" | "events" | "quiz">("summary");
    
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

    // Keyword categories for Tab 1 (자세하게 내용 강화 및 킬러 선지 연동)
    const keywordCategories = [
        {
            title: "1. 선사 ~ 여러 나라의 성장 (기반 확립)",
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            iconColor: "text-blue-500",
            items: [
                { keyword: "구석기 시대", desc: "뗀석기(주먹도끼, 찍개, 슴베찌르개) 사용. 사냥과 채집을 위해 동굴, 바위 그늘, 강가 막집에 거주하며 주기적으로 이동 생활 영위. (평등 사회)" },
                { keyword: "신석기 시대", desc: "빗살무늬 토기 사용, 가락바퀴와 뼈바늘을 활용한 원시 수공업(의복/그물 제작). 정착 생활(움집)과 밭농사(조·수수·기장) 목축 시작. 원시 신앙(애니미즘, 샤머니즘) 형성." },
                { keyword: "청동기 시대", desc: "비파형 동검(고조선 영역), 반달 돌칼(곡물 수확 석기), 고인돌(계급 지배자 무덤), 미송리식 토기 사용. 벼농사 수확 본격화, 사유 재산과 빈부 격차 발생." },
                { keyword: "철기 시대", desc: "철제 농기구(생산력 급증) 및 철제 무기(정복 격화) 보급. 세형 동검과 거푸집(한반도 독자적 청동기 제작). 명도전·붓(창원 다호리) 출토로 중국과의 교류 및 문자 사용 확인." },
                { keyword: "고조선", desc: "단군왕검(제정일치 군장) 건국. 위만 집권(기원전 194년) 이후 철기 문화 본격화 및 중계 무역 독점. 8조법 시행(생명 중시, 사유재산 인정, 신분제 존재)." },
                { keyword: "부여", desc: "5부족 연맹체. 왕권 미약(가뭄 책임 전가), 마가·우가·저가·구가의 사출도 독자 통치. 영고(12월 제천행사), 1책 12법, 순장 및 형사취수제 풍습." },
                { keyword: "고구려", desc: "동맹(10월 제천행사), 서옥제(데릴사위제), 부경(약탈 창고). 5부족 연맹 및 제가 회의(귀족 대표들이 국가 중대사 결정)." },
                { keyword: "옥저 & 동예", desc: "왕이 없음(읍군·삼로 군장 지배). 옥저: 민며느리제, 골장제(뼈만 가족 공동 목곽에 안치). 동예: 무천(10월), 책화(경계 침범 시 보상), 족외혼, 특산물(단궁·과하마·반어피)." },
                { keyword: "삼한", desc: "제정 분리 사회(정치: 신지·읍차 vs 종교: 천군과 소도). 벼농사 고도 발달(두레, 저수지). 변한의 풍부한 철 생산 및 낙랑/왜 수출." }
            ]
        },
        {
            title: "2. 고대 (삼국 ~ 남북국 시대 전성기)",
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            iconColor: "text-indigo-500",
            items: [
                { keyword: "고구려 국왕", desc: "고국천왕(진대법 실시로 빈민 구율) ➡️ 광개토대왕(신라 내물왕 구원, 왜 격퇴, 호우명 그릇 증명, 영락 연호) ➡️ 장수왕(평양 천도, 남진 정책으로 한강 유역 장악, 중원고구려비 건립)." },
                { keyword: "백제 국왕", desc: "고이왕(율령 반포, 6좌평 16관등) ➡️ 근초고왕(요서·산둥 진출, 마한 복속, 평양성 고국원왕 전사) ➡️ 무령왕(지방 22담로 왕족 파견, 벽돌무덤) ➡️ 성왕(사비 천도, 관산성 전투 전사)." },
                { keyword: "신라 국왕", desc: "내물왕(마립간, 왜 격퇴) ➡️ 지증왕(신라 국호 확정, 왕 칭호, 우산국 복속, 우경 및 동시전) ➡️ 법흥왕(율령, 불교 공인, 병부 설치, 금관가야 병합) ➡️ 진흥왕(화랑도 개편, 한강 장악, 대가야 멸망, 순수비)." },
                { keyword: "통일신라", desc: "무열왕(최초 진골 왕) ➡️ 문무왕(삼국 통일 완수, 676년) ➡️ 신문왕(왕권 절대화, 김흠돌 숙청, 관료전 지급 & 녹읍 폐지, 국학 설치, 9주 5소경 체제 정비)." },
                { keyword: "발해 국왕", desc: "대조영(고구려 유민 이끌고 길림 동모산 건국) ➡️ 무왕(인안 연호, 당 산둥 공격) ➡️ 문왕(대흥 연호, 3성 6부 정비, 친선) ➡️ 선왕(영토 최대 판도, 해동성국 극찬)." }
            ]
        },
        {
            title: "3. 고려 시대 (통합과 외침의 시기)",
            bg: "bg-teal-50/50",
            border: "border-teal-100",
            iconColor: "text-teal-500",
            items: [
                { keyword: "기틀 확립", desc: "태조 왕건(정략결혼, 기인·사심관제, 빈민구제 흑창, 훈요십조) ➡️ 광종(★노비안검법, 과거제 최초 실시, 백관 공복) ➡️ 성종(최승로 시무 28조 수용, 12목 파견, 유학 진흥)." },
                { keyword: "거란 & 여진", desc: "거란: 1차 서희 외교 담판(강동 6주), 3차 강감찬 귀주대첩(수공 및 풍향 활용 대승). 여진: 윤관 건의로 별무반(신기·신보·항마군) 조직, 여진 정벌 후 동북 9성 개척." },
                { keyword: "몽골 침입", desc: "최씨 무신정권의 강화도 장기 항전 천도 ➡️ 충주성 처인성(김윤후가 몽골 사령관 살리타이 사살) 등 민중 결사 항전 ➡️ 강화 환도 후 삼별초의 대몽 항쟁(강화도 ➡️ 진도 ➡️ 제주도)." },
                { keyword: "개혁 정치", desc: "공민왕의 대대적 개혁: 친원 기철 숙청, 정동행성 이문소 폐지, 쌍성총관부 무력 탈환 및 영토 회복. 신돈 등용 및 전민변정도감 설치로 권문세족의 불법 농장과 노비 혁파." },
                { keyword: "고려 경제/문화", desc: "벽란도(국제 무역항, 아라비아 상인 교역, '코리아' 기원). 활구(은병) 주조. 삼국사기(김부식, 기전체) 및 삼국유사(일연, 불교·신화 수록). 팔만대장경 판각." }
            ]
        },
        {
            title: "4. 조선 시대 (유교 정치의 완성)",
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            iconColor: "text-amber-500",
            items: [
                { keyword: "전기 국왕", desc: "태종(6조 직계제, 사병 혁파, 호패법) ➡️ 세종(의정부 서사제, 집현전, 공법 투표, 4군 6진, 쓰시마 정벌, 칠정산) ➡️ 세조(직전법 실시, 6조 직계제 부활) ➡️ 성종(★경국대전 최종 완성 및 반포)." },
                { keyword: "통치 기구", desc: "의정부(최고 합의)와 6조(행정). 3사(사헌부·사간원·홍문관)의 권력 독점 견제 언론 기능. 국왕 직속 사법 의금부와 왕명 출납 승정원. 지방에 8도 관찰사 파견 및 향청/유향소 존재." },
                { keyword: "조선 수난", desc: "임진왜란(1592): 곽재우 등 의병 활약, 이순신의 남해 제해권 장악(한산도 대첩 학익진). 병자호란(1636): 강화 실패 후 남한산성 피란 및 삼전도의 굴욕(군신 관계 수용)." },
                { keyword: "대동법", desc: "공납의 폐단을 개혁하기 위해 특산물 대신 토지 결수(1결당 12두) 기준으로 쌀, 삼베, 동전으로 징수. 공인(★국가 허가 상인)의 등장으로 전국적 상품 화폐 경제 발달 촉진." },
                { keyword: "영·정조 탕평", desc: "영조: 완론 탕평, 서원 대폭 정리, 군역 부담을 줄인 균역법(균역청 설치, 결작 2두). 정조: 규장각 중용, 장용영(친위 부대) 창설, 수원 화성 축조, 금난전권 철폐(신해통공)." }
            ]
        },
        {
            title: "5. 근현대사 (격동의 역사)",
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            iconColor: "text-rose-500",
            items: [
                { keyword: "대원군 개혁", desc: "세도 정치 청산, 비변사 폐지, 대전회통 편찬. 만동묘 및 서원 철폐. 경복궁 중건 및 당백전 난발로 재정 파탄. 병인양요·신미양요 격퇴 후 전국 척화비 건립." },
                { keyword: "개항기 변란", desc: "임오군란(1882): 구식 군대 차별 분노 ➡️ 청군 개입 및 제물포 조약. 갑신정변(1884): 급진개화파 3일천하 ➡️ 한성 조약. 동학농민운동(1894): 반외세·반봉건 봉기, 집강소 설치, 우금치 전투 패배." },
                { keyword: "갑오·광무개혁", desc: "갑오개혁(1894): 군국기무처 주도, 신분제 폐지, 과거제 폐지. 광무개혁(1897): 대한제국 선포, '구본신참' 원칙 하에 양전 사업 실시 및 지계(근대적 토지 문서) 발급." },
                { keyword: "일제 통치", desc: "1910년대 무단 통치(헌병 경찰, 토지조사사업) ➡️ 1920년대 문화 통치(보통 경찰, 기만책, 산미증식계획) ➡️ 1930년대 민족말살 통치(창씨개명, 신사참배, 징용·징병 인적/물적 수탈)." },
                { keyword: "현대 민주주의", desc: "4·19 혁명(1960, 이승만 하야) ➡️ 5·18 민주화 운동(1980, 신군부 계엄 확대 반대, 광주 시민 저항) ➡️ 6월 민주 항쟁(1987, 박종철·이한열 희생, 대통령 직선제 개헌 쟁취)." }
            ]
        }
    ];

    const currentQuestion = shuffledQuizzes[currentQuizIndex];
    const userPreviousRecord = currentQuestion ? quizRecords[currentQuestion.id] : null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
            {/* Header Title */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-toss-blue/10 text-toss-blue px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    벼락치기 초고효율 코너 (D-1)
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    단 하루로 합격 확률 극대화하기
                </h1>
                <p className="text-slate-600 text-sm font-medium">
                    필수 정답 키워드 요약, 시대별 군왕/사건 연대기, 그리고 핵심 기출로 한 번에 고정하세요.
                </p>
            </div>

            {/* Tab Controller */}
            <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-200 p-1 bg-slate-100/80 rounded-2xl max-w-3xl mx-auto gap-1">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                        activeTab === "summary"
                            ? "bg-white text-toss-blue shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    초고효율 요약본
                </button>
                <button
                    onClick={() => setActiveTab("kings")}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                        activeTab === "kings"
                            ? "bg-white text-toss-blue shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Crown className="w-4 h-4" />
                    시대별 군왕 & 우두머리
                </button>
                <button
                    onClick={() => setActiveTab("events")}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                        activeTab === "events"
                            ? "bg-white text-toss-blue shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Film className="w-4 h-4" />
                    시대별 주요 사건
                </button>
                <button
                    onClick={() => {
                        setActiveTab("quiz");
                        setQuizStarted(false);
                    }}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                        activeTab === "quiz"
                            ? "bg-white text-toss-blue shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
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
                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/80 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            <h2 className="text-xl font-bold text-slate-900">🕒 한눈에 파악하는 시대별 핵심 타임라인</h2>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                            한능검의 킬러 유형인 &apos;시대적 순서&apos;를 맞히는 핵심 로드맵입니다. 머릿속에 이 흐름을 사진 찍듯 박제해 두세요.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            {/* 고대 삼국 */}
                            <div className="bg-gradient-to-b from-blue-50/30 to-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">고대 삼국 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-slate-800">
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
                            <div className="bg-gradient-to-b from-teal-50/30 to-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <span className="bg-teal-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">고려 시대 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-slate-800">
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">태조 왕건 <span className="text-[10px] text-teal-600 block mt-0.5">(국가 통합, 기인·사심관제)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm border-teal-200">광종 <span className="text-[10px] text-teal-600 block mt-0.5">(★노비안검법 & 과거제 실시)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">성종 <span className="text-[10px] text-teal-600 block mt-0.5">(시무 28조 반영, 12목 파견)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 shadow-sm text-left">
                                        <div className="font-extrabold text-center text-teal-800 border-b border-teal-200 pb-1 mb-1">외침 수난 연대기</div>
                                        <div className="space-y-1 text-[10px] text-slate-600">
                                            <div>1. 거란: 서희 강동6주 ➡️ 강감찬 귀주</div>
                                            <div>2. 여진: 윤관 별무반 ➡️ 동북9성</div>
                                            <div>3. 몽골: 강화 천도 ➡️ 김윤후 처인성</div>
                                            <div>4. 왜구: 최무선 화포 ➡️ 황산·홍산대첩</div>
                                        </div>
                                    </div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-teal-300" />
                                    <div className="bg-teal-600 text-white p-2.5 rounded-xl border shadow-sm">공민왕 <span className="text-[10px] text-teal-100 block mt-0.5">(반원 자주, 쌍성총관부 수복)</span></div>
                                </div>
                            </div>

                            {/* 조선 시대 */}
                            <div className="bg-gradient-to-b from-amber-50/30 to-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <span className="bg-amber-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">조선 시대 흐름</span>
                                <div className="space-y-2 w-full text-xs font-semibold text-slate-800">
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">태조·태종 <span className="text-[10px] text-amber-600 block mt-0.5">(조선 개국, 6조 직계제)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm border-amber-200">세종대왕 <span className="text-[10px] text-amber-600 block mt-0.5">(훈민정음, 4군 6진, 공법)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">성종 <span className="text-[10px] text-amber-600 block mt-0.5">(★경국대전 최종 반포)</span></div>
                                    <ArrowDown className="w-4 h-4 mx-auto text-amber-300" />
                                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 shadow-sm text-left">
                                        <div className="font-extrabold text-center text-amber-800 border-b border-amber-200 pb-1 mb-1">양란 발생 및 체제 개편</div>
                                        <div className="space-y-1 text-[10px] text-slate-600">
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
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-toss-blue" />
                            🔑 시대별 정답 키워드 팩 (Top 5 핵심 암기)
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {keywordCategories.map((cat, idx) => (
                                <div key={idx} className={`p-6 rounded-[28px] border ${cat.border} ${cat.bg} shadow-sm hover:shadow-md transition-all duration-300`}>
                                    <h3 className="font-extrabold text-lg text-slate-900 border-b pb-2 flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${cat.iconColor} bg-current`} />
                                        {cat.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/50 space-y-2 shadow-sm hover:border-toss-blue/30 transition-all duration-200">
                                                <span className={`inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 ${cat.iconColor}`}>
                                                    {item.keyword}
                                                </span>
                                                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
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

            {/* TAB 2: ERA KINGS & HEADS */}
            {activeTab === "kings" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-3">
                        <Crown className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs md:text-sm font-semibold text-slate-700">
                            <p className="text-slate-900 font-extrabold">👑 시대별 통치권자 & 우두머리 한눈에 읽기</p>
                            <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                                한능검에서는 각 왕의 <strong>특정 시기 업적</strong>을 고르는 1문항이 반드시 출제됩니다. 특히 왕이 존재하지 않았던 선사 시대에는 조직 형태와 경제 배경의 상호 연계 구조를 반드시 이해해야 합니다.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {ERA_KINGS.map((era) => (
                            <div key={era.eraId} className={`p-6 md:p-8 rounded-[32px] border ${era.border} ${era.bg} space-y-6 shadow-sm`}>
                                <h3 className={`font-black text-xl flex items-center gap-2 ${era.textColor}`}>
                                    <Crown className="w-5 h-5" />
                                    {era.eraName}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {era.kings.map((king, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-blue-300 transition-colors flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-black text-slate-900 flex items-center gap-1.5`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                        {king.name}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md">
                                                        <Calendar className="w-3 h-3" />
                                                        {king.period}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-semibold leading-relaxed pt-1 border-t border-slate-100">
                                                    {king.desc}
                                                </p>
                                                <ul className="space-y-2 pt-2">
                                                    {king.achievements.map((ach, aIdx) => (
                                                        <li key={aIdx} className="text-[11px] md:text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-1.5 pl-1">
                                                            <span className="text-toss-blue font-bold flex-shrink-0 mt-0.5">•</span>
                                                            {ach}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {king.note && (
                                                <div className="mt-4 bg-yellow-50/50 border border-yellow-100 p-3.5 rounded-xl text-[10px] md:text-[11px] text-slate-700 font-semibold leading-relaxed shadow-sm">
                                                    {king.note}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: ERA EVENTS */}
            {activeTab === "events" && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div className="bg-teal-50/50 border border-teal-100 p-5 rounded-2xl flex items-start gap-3">
                        <Compass className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs md:text-sm font-semibold text-slate-700">
                            <p className="text-slate-900 font-extrabold">⚔️ 시대별 핵심 사건 연대기 & 미디어 매칭</p>
                            <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                                역사적 대변란이나 승리 대첩들은 영화, 드라마 등으로 다수 재현되었습니다. <strong>대중 미디어 콘텐츠와 매칭</strong>하여 사건의 전후 맥락을 입체적으로 각인해 두면 시험장에서 쉽게 유추할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12 relative border-l-2 border-slate-200/70 pl-6 ml-4">
                        {ERA_EVENTS.map((era) => (
                            <div key={era.eraId} className="space-y-6 relative">
                                {/* Dot on timeline */}
                                <span className={`absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-toss-blue shadow-sm z-10`} />
                                
                                <h3 className={`font-black text-xl flex items-center gap-2 ${era.textColor} bg-slate-50 py-1 px-3 rounded-lg inline-flex shadow-sm border border-slate-200/50`}>
                                    {era.eraName}
                                </h3>

                                <div className="space-y-6">
                                    {era.events.map((event, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-toss-blue/60 group-hover:bg-toss-blue transition-colors" />
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                                                <h4 className="text-base font-black text-slate-950 flex items-center gap-2">
                                                    {event.name}
                                                </h4>
                                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2.5 py-1 rounded-md self-start sm:self-auto">
                                                    <Calendar className="w-3 h-3" />
                                                    {event.period}
                                                </span>
                                            </div>

                                            {/* Characters Tags */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    주요 인물:
                                                </span>
                                                {event.characters.map((char, cIdx) => (
                                                    <span key={cIdx} className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                                        {char}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold pt-1">
                                                {event.desc}
                                            </p>

                                            {event.media && (
                                                <div className="bg-gradient-to-r from-red-50/50 to-orange-50/50 border border-red-100 p-4 rounded-2xl flex items-start gap-2.5 mt-2 shadow-sm">
                                                    <Film className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-extrabold text-red-600 tracking-wide uppercase">🎬 미디어 연계 콘텐츠 추천</span>
                                                        <p className="text-[11px] md:text-xs text-slate-800 font-extrabold leading-relaxed">
                                                            {event.media}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: CRAM QUIZ CONTENT */}
            {activeTab === "quiz" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {!quizStarted ? (
                        /* Quiz Starter Config UI */
                        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/80 shadow-md space-y-8 max-w-2xl mx-auto">
                            <div className="border-b pb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-toss-blue animate-pulse" />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">벼락치기 맞춤 학습 설정</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        원하는 시대 범위와 문항 수를 선택하고 지금 바로 퀴즈를 풀며 정답을 각인해 보세요.
                                    </p>
                                </div>
                            </div>

                            {/* Section 1: Era Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-800 block">
                                    1. 학습할 시대 선택
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ERA_OPTIONS.map((opt) => {
                                        const isSelected = selectedEra === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSelectedEra(opt.id)}
                                                className={`text-left p-3.5 border rounded-xl transition-all relative flex flex-col justify-between h-20 hover:border-toss-blue/40 ${
                                                    isSelected
                                                        ? "border-toss-blue bg-blue-50/30 ring-1 ring-toss-blue/20"
                                                        : "border-slate-200 bg-white"
                                                }`}
                                            >
                                                <span className={`text-xs md:text-sm font-bold ${
                                                    isSelected ? "text-toss-blue" : "text-slate-800"
                                                }`}>
                                                    {opt.name}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 self-end">
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
                                <label className="text-sm font-bold text-slate-800 block">
                                    2. 풀고 싶은 문제 수 선택
                                </label>
                                <div className="flex border border-slate-200 p-1 bg-slate-100 rounded-xl max-w-sm">
                                    {[10, 20, 50].map((count) => {
                                        const isSelected = selectedCount === count;
                                        return (
                                            <button
                                                key={count}
                                                onClick={() => setSelectedCount(count)}
                                                className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                                                    isSelected
                                                        ? "bg-white text-toss-blue shadow-sm"
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                {count}문항
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Instructions info */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-[11px] text-slate-500 leading-relaxed font-semibold">
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
                        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-200/60 shadow-lg text-center space-y-6 max-w-xl mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-toss-blue/10 text-toss-blue mb-2">
                                <Award className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-slate-900">학습을 완료했습니다! 🎉</h2>
                                <p className="text-slate-600 text-sm font-medium">
                                    [{ERA_OPTIONS.find(o => o.id === selectedEra)?.name}] 영역의 퀴즈 세션 결과입니다.
                                </p>
                            </div>

                            {/* Final Score Board */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center gap-1.5 max-w-xs mx-auto">
                                <span className="text-xs font-bold text-slate-500">나의 최종 점수</span>
                                <div className="text-3xl font-black text-toss-blue">
                                    {score} <span className="text-lg font-bold text-slate-800">/ {shuffledQuizzes.length} 문항</span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 mt-1">
                                    (정답률 {shuffledQuizzes.length > 0 ? Math.round((score / shuffledQuizzes.length) * 100) : 0}%)
                                </span>
                            </div>

                            <div className="text-xs text-slate-500 leading-relaxed font-semibold">
                                틀린 문제는 요약 탭의 키워드를 다시 읽어 완벽히 숙지해 보세요.<br />
                                아래 버튼을 눌러 동일 조건을 다시 풀거나, 다른 조건을 설정할 수 있습니다.
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                                <button
                                    onClick={() => setQuizStarted(false)}
                                    className="px-5 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 text-xs transition-all active:scale-95"
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
                            <div className="bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                    <span className="font-extrabold text-slate-800 text-sm whitespace-nowrap">
                                        진행 상황 ({currentQuizIndex + 1} / {shuffledQuizzes.length})
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (confirm("퀴즈 풀이를 중단하고 설정 화면으로 돌아가시겠습니까?")) {
                                                setQuizStarted(false);
                                            }
                                        }}
                                        className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        중단 및 설정 변경
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-2/3">
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div 
                                            className="bg-toss-blue h-2.5 rounded-full transition-all duration-300" 
                                            style={{ width: `${shuffledQuizzes.length > 0 ? ((currentQuizIndex + 1) / shuffledQuizzes.length) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                                        {shuffledQuizzes.length > 0 ? Math.round(((currentQuizIndex + 1) / shuffledQuizzes.length) * 100) : 0}%
                                    </span>
                                </div>
                            </div>

                            {/* Question Container Card */}
                            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm space-y-6">
                                
                                {/* Badge Zone: Personal History Tag */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-toss-blue/10 text-toss-blue text-[10px] px-2.5 py-1 rounded-md font-bold">
                                            {shuffledQuizzes[currentQuizIndex]?.era}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-md font-bold">
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
                                        <span className="inline-flex items-center justify-center bg-toss-blue text-white w-6 h-6 rounded-full text-xs font-black flex-shrink-0 mt-0.5">
                                            Q
                                        </span>
                                        <h3 className="text-base font-extrabold leading-relaxed text-slate-900 whitespace-pre-line">
                                            {shuffledQuizzes[currentQuizIndex]?.contentText}
                                        </h3>
                                    </div>
                                </div>

                                {/* Multiple Choices */}
                                 <div className="flex flex-col gap-3.5 pt-2">
                                     {shuffledQuizzes[currentQuizIndex]?.choices.map((choice, idx) => {
                                         const isSelected = selectedAnswer === idx;
                                         const isCorrect = idx === shuffledQuizzes[currentQuizIndex].answer;
                                         
                                         let optionStyle = "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-sm";
                                         if (isEvaluated) {
                                             if (isCorrect) {
                                                 optionStyle = "border-green-500 bg-green-50 text-green-700 font-bold shadow-md ring-2 ring-green-500/20";
                                             } else if (isSelected) {
                                                 optionStyle = "border-red-500 bg-red-50 text-red-700 font-bold ring-2 ring-red-500/20";
                                             } else {
                                                 optionStyle = "border-slate-100 bg-white text-slate-300 opacity-50 cursor-not-allowed";
                                             }
                                         } else if (isSelected) {
                                             optionStyle = "border-toss-blue bg-blue-50/40 text-toss-blue font-extrabold shadow-md ring-2 ring-toss-blue/20";
                                         }
 
                                         return (
                                             <button
                                                 key={idx}
                                                 disabled={isEvaluated}
                                                 onClick={() => handleAnswerSelect(idx)}
                                                 className={`w-full text-left px-6 py-5 rounded-2xl border transition-all text-base font-semibold leading-relaxed ${optionStyle} ${!isEvaluated ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`}
                                             >
                                                 <span className="flex items-start gap-3 w-full">
                                                     <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                                                         isEvaluated 
                                                             ? isCorrect 
                                                                 ? "bg-green-600 text-white" 
                                                                 : isSelected 
                                                                     ? "bg-red-600 text-white" 
                                                                     : "bg-slate-100 text-slate-300"
                                                             : isSelected
                                                                 ? "bg-toss-blue text-white"
                                                                 : "bg-slate-100 text-slate-600"
                                                     }`}>
                                                         {idx + 1}
                                                     </span>
                                                     <span className="flex-1">{choice}</span>
                                                     {isEvaluated && isCorrect && (
                                                         <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 self-center ml-auto" />
                                                     )}
                                                     {isEvaluated && isSelected && !isCorrect && (
                                                         <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 self-center ml-auto" />
                                                     )}
                                                 </span>
                                             </button>
                                         );
                                     })}
                                 </div>

                                 {/* Evaluation Feedback Zone */}
                                {isEvaluated && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                                        <div className={`flex items-center gap-2.5 p-4 rounded-xl text-xs md:text-sm font-bold leading-relaxed border ${
                                            selectedAnswer === shuffledQuizzes[currentQuizIndex].answer
                                                ? "bg-green-50/60 text-green-700 border-green-100"
                                                : "bg-red-50/60 text-red-700 border-red-100"
                                        }`}>
                                            {selectedAnswer === shuffledQuizzes[currentQuizIndex].answer ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    정답입니다! 정확한 개념을 파악하고 계시네요.
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                    아쉽게도 오답입니다. 정답은 {shuffledQuizzes[currentQuizIndex].answer + 1}번입니다.
                                                </>
                                            )}
                                        </div>

                                        {/* Explanation Card */}
                                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wide">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                한능검 벼락치기 핵심 해설
                                            </div>
                                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold pl-3 whitespace-pre-line border-l-2 border-slate-200">
                                                {shuffledQuizzes[currentQuizIndex]?.explanation}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons Panel */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs text-slate-400 font-bold">
                                        한능검 변형 실전 연습 세션
                                    </span>
                                    
                                    {!isEvaluated ? (
                                        <button
                                            disabled={selectedAnswer === null}
                                            onClick={handleEvaluate}
                                            className={`px-8 py-3.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 ${
                                                selectedAnswer !== null
                                                    ? "bg-toss-blue text-white hover:bg-toss-blueHover"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed border"
                                            }`}
                                        >
                                            정답 확인하기
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            className="px-8 py-3.5 bg-slate-900 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-slate-800 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                        >
                                            {currentQuizIndex === shuffledQuizzes.length - 1 ? "최종 결과 보기" : "다음 문제 풀기"}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
