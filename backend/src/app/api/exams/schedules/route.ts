import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { ExamSchedule } from "@/entities/ExamSchedule";
import { ExamNotification } from "@/entities/ExamNotification";
import { verifyToken } from "@/lib/auth";

interface RawScheduleData {
    round: number;
    year: number;
    registerStart: Date;
    registerEnd: Date;
    examDate: Date;
    resultDate: Date;
    applyUrl: string;
}

// 2024~2025년 과거 시험 일정 고정 시드 데이터
const pastSeedData: RawScheduleData[] = [
    {
        round: 69,
        year: 2024,
        registerStart: new Date("2024-01-16T10:00:00+09:00"),
        registerEnd: new Date("2024-01-23T17:00:00+09:00"),
        examDate: new Date("2024-02-17T10:00:00+09:00"),
        resultDate: new Date("2024-02-29T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 70,
        year: 2024,
        registerStart: new Date("2024-04-23T10:00:00+09:00"),
        registerEnd: new Date("2024-04-30T17:00:00+09:00"),
        examDate: new Date("2024-05-25T10:00:00+09:00"),
        resultDate: new Date("2024-06-05T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 71,
        year: 2024,
        registerStart: new Date("2024-07-09T10:00:00+09:00"),
        registerEnd: new Date("2024-07-16T17:00:00+09:00"),
        examDate: new Date("2024-08-10T10:00:00+09:00"),
        resultDate: new Date("2024-08-22T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 72,
        year: 2024,
        registerStart: new Date("2024-09-10T10:00:00+09:00"),
        registerEnd: new Date("2024-09-17T17:00:00+09:00"),
        examDate: new Date("2024-10-20T10:00:00+09:00"),
        resultDate: new Date("2024-10-31T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 73,
        year: 2025,
        registerStart: new Date("2025-01-07T10:00:00+09:00"),
        registerEnd: new Date("2025-01-14T17:00:00+09:00"),
        examDate: new Date("2025-02-16T10:00:00+09:00"),
        resultDate: new Date("2025-02-27T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 74,
        year: 2025,
        registerStart: new Date("2025-04-22T10:00:00+09:00"),
        registerEnd: new Date("2025-04-29T17:00:00+09:00"),
        examDate: new Date("2025-05-24T10:00:00+09:00"),
        resultDate: new Date("2025-06-05T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 75,
        year: 2025,
        registerStart: new Date("2025-07-08T10:00:00+09:00"),
        registerEnd: new Date("2025-07-15T17:00:00+09:00"),
        examDate: new Date("2025-08-09T10:00:00+09:00"),
        resultDate: new Date("2025-08-21T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 76,
        year: 2025,
        registerStart: new Date("2025-09-16T10:00:00+09:00"),
        registerEnd: new Date("2025-09-23T17:00:00+09:00"),
        examDate: new Date("2025-10-18T10:00:00+09:00"),
        resultDate: new Date("2025-10-31T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
];

// 2026년 일정 대비용 예비 시드 데이터 (크롤링 실패 시 활용)
const fallbackSeedData2026: RawScheduleData[] = [
    {
        round: 77,
        year: 2026,
        registerStart: new Date("2026-01-06T10:00:00+09:00"),
        registerEnd: new Date("2026-01-13T17:00:00+09:00"),
        examDate: new Date("2026-02-07T10:00:00+09:00"),
        resultDate: new Date("2026-02-20T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 78,
        year: 2026,
        registerStart: new Date("2026-04-21T10:00:00+09:00"),
        registerEnd: new Date("2026-04-28T17:00:00+09:00"),
        examDate: new Date("2026-05-23T10:00:00+09:00"),
        resultDate: new Date("2026-06-05T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 79,
        year: 2026,
        registerStart: new Date("2026-07-07T10:00:00+09:00"),
        registerEnd: new Date("2026-07-14T17:00:00+09:00"),
        examDate: new Date("2026-08-09T10:00:00+09:00"),
        resultDate: new Date("2026-08-21T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 80,
        year: 2026,
        registerStart: new Date("2026-09-15T10:00:00+09:00"),
        registerEnd: new Date("2026-09-22T17:00:00+09:00"),
        examDate: new Date("2026-10-17T10:00:00+09:00"),
        resultDate: new Date("2026-10-30T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    },
    {
        round: 81,
        year: 2026,
        registerStart: new Date("2026-11-03T10:00:00+09:00"),
        registerEnd: new Date("2026-11-10T17:00:00+09:00"),
        examDate: new Date("2026-11-28T10:00:00+09:00"),
        resultDate: new Date("2026-12-11T10:00:00+09:00"),
        applyUrl: "https://www.historyexam.go.kr/"
    }
];

// 공식 웹사이트 시험일정 페이지에서 직접 크롤링 및 파싱
async function fetchAndParseOfficialSchedules(): Promise<RawScheduleData[]> {
    try {
        console.log("🌐 [Schedule Crawler] Requesting official exam schedule page...");
        // netfunnel_key 파라미터는 일회성이므로 제외하고 안전하게 다이렉트 호출
        const targetUrl = "https://www.historyexam.go.kr/pageLink.do?link=examSchedule";
        
        const res = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            next: { revalidate: 3600 }, // 1시간 캐싱
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const html = await res.text();
        const parsedSchedules: RawScheduleData[] = [];

        // 1. "원서접수"와 "합격자발표"를 포함하는 테이블 내용 추출
        const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
        let match;
        let targetTableHtml = "";

        while ((match = tableRegex.exec(html)) !== null) {
            const tableContent = match[1];
            if (tableContent.includes("원서접수") && tableContent.includes("합격자발표") && tableContent.includes("구분")) {
                targetTableHtml = tableContent;
                break;
            }
        }

        if (!targetTableHtml) {
            console.warn("⚠️ [Schedule Crawler] Target table not found in official HTML.");
            return [];
        }

        // 2. 행(tr) 파싱
        const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
        let trMatch;

        while ((trMatch = trRegex.exec(targetTableHtml)) !== null) {
            const trContent = trMatch[1];
            if (trContent.includes("<th") || trContent.includes("구분")) {
                continue; // 헤더 로우 건너뛰기
            }

            // 3. 열(td) 파싱
            const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
            const tds: string[] = [];
            let tdMatch;
            while ((tdMatch = tdRegex.exec(trContent)) !== null) {
                tds.push(tdMatch[1].trim());
            }

            if (tds.length >= 5) {
                const roundMatch = tds[0].match(/제\s*(\d+)\s*회/);
                if (!roundMatch) continue;
                const round = parseInt(roundMatch[1], 10);

                const parseDate = (text: string, isEnd = false): Date | null => {
                    const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
                    let targetText = cleanText;
                    if (cleanText.includes("~")) {
                        const parts = cleanText.split("~");
                        targetText = isEnd ? parts[1] : parts[0];
                    }

                    // 정규식: 연도, 월, 일, 시간, 분 추출 (괄호 안 영어/한글 요일 지원)
                    const dateRegex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\([A-Za-z가-힣]+\))?(?:\s*(\d{1,2}):(\d{1,2}))?/;
                    const dateMatch = targetText.match(dateRegex);
                    if (dateMatch) {
                        const year = parseInt(dateMatch[1], 10);
                        const month = parseInt(dateMatch[2], 10) - 1;
                        const day = parseInt(dateMatch[3], 10);
                        const hour = dateMatch[4] ? parseInt(dateMatch[4], 10) : (isEnd ? 17 : 10);
                        const minute = dateMatch[5] ? parseInt(dateMatch[5], 10) : 0;

                        const pad = (n: number) => String(n).padStart(2, '0');
                        const isoString = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+09:00`;
                        return new Date(isoString);
                    }
                    return null;
                };

                const registerStart = parseDate(tds[1], false);
                const registerEnd = parseDate(tds[1], true);
                const examDate = parseDate(tds[3], false);
                const resultDate = parseDate(tds[4], false);

                if (registerStart && registerEnd && examDate && resultDate) {
                    const year = examDate.getFullYear();
                    parsedSchedules.push({
                        round,
                        year,
                        registerStart,
                        registerEnd,
                        examDate,
                        resultDate,
                        applyUrl: "https://www.historyexam.go.kr/"
                    });
                }
            }
        }

        console.log(`✅ [Schedule Crawler] Successfully parsed ${parsedSchedules.length} schedules from official site.`);
        return parsedSchedules;
    } catch (error) {
        console.error("❌ [Schedule Crawler] Failed to fetch or parse official schedules:", error);
        return [];
    }
}

// GET: 전체 시험 일정 목록 조회 (과거 시드 + 크롤링 병합 및 동적 상태 계산)
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const scheduleRepo = dataSource.getRepository(ExamSchedule);

        // DB 일정 데이터 확인
        let schedules = await scheduleRepo.find({ order: { round: "ASC" } });

        // 데이터가 69회~81회 총 13개 레코드로 채워지지 않았거나, 데이터 상태가 유효하지 않으면 대대적인 동기화 가동
        const hasInvalidData = schedules.some(s => s.round >= 73 && s.round <= 76 && s.year === 2026); // 구버전 오염 데이터 감지
        const needsSync = schedules.length < 13 || hasInvalidData;

        if (needsSync) {
            console.log("🔄 [Schedule API] Syncing 2024~2026 schedules from past seed data & official web site...");
            
            // 1. 공식 사이트 실시간 크롤링 및 파싱 가동
            let officialSchedules = await fetchAndParseOfficialSchedules();

            // 2. 크롤러 네트워크 차단 등으로 2026년 데이터가 완전히 안 뽑혔을 경우를 위한 fallback 머지 설계
            if (officialSchedules.length === 0) {
                console.warn("⚠️ [Schedule API] Official site parser returned empty. Using 2026 fallback seed data...");
                officialSchedules = fallbackSeedData2026;
            }

            // 3. pastSeedData와 officialSchedules 병합 (round 기준 중복 제거 및 덮어쓰기)
            const mergedMap = new Map<number, RawScheduleData>();
            
            // 과거 고정 시드 먼저 주입
            pastSeedData.forEach(item => {
                mergedMap.set(item.round, item);
            });

            // 실시간 공식 파싱 데이터 덮어쓰기 및 추가
            officialSchedules.forEach(item => {
                mergedMap.set(item.round, item);
            });

            const mergedList = Array.from(mergedMap.values()).sort((a, b) => a.round - b.round);

            if (mergedList.length > 0) {
                // 기존 스케줄 데이터 완전 청소 후 재생성 저장
                await scheduleRepo.clear();
                const entities = scheduleRepo.create(mergedList);
                await scheduleRepo.save(entities);
                schedules = await scheduleRepo.find({ order: { round: "ASC" } });
            }
        }

        // 로그인한 회원인 경우 알람 신청 여부 조회
        const authHeader = request.headers.get("Authorization");
        let userId: string | null = null;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            if (token) {
                const decoded = verifyToken(token);
                if (decoded) {
                    userId = decoded.userId;
                }
            }
        }

        // KST 기준 현재시각과 비교하여 실시간 상태 부여
        const now = new Date();

        let result = schedules.map(s => {
            const examDateTime = new Date(s.examDate).getTime();
            const status = now.getTime() > examDateTime ? "마감" : "진행 중";

            return {
                ...s,
                status,
                isSubscribed: false,
            };
        });

        if (userId) {
            const notifRepo = dataSource.getRepository(ExamNotification);
            const subscriptions = await notifRepo.find({ where: { userId } });
            const subIds = new Set(subscriptions.map(sub => sub.scheduleId));

            result = result.map(r => ({
                ...r,
                isSubscribed: subIds.has(r.id),
            }));
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
