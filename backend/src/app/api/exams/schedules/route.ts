import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { ExamSchedule } from "@/entities/ExamSchedule";
import { ExamNotification } from "@/entities/ExamNotification";
import { verifyToken } from "@/lib/auth";

// 2024~2025년 과거 시험 일정 고정 시드 데이터 (공식 사이트에서 만료되어 나오지 않는 과거 기록 보존용)
const pastSeedData = [
    {
        round: 69,
        year: 2024,
        registerStart: new Date("2024-01-16T10:00:00+09:00"),
        registerEnd: new Date("2024-01-23T17:00:00+09:00"),
        examDate: new Date("2024-02-17T10:00:00+09:00"),
        resultDate: new Date("2024-02-29T10:00:00+09:00"),
    },
    {
        round: 70,
        year: 2024,
        registerStart: new Date("2024-04-23T10:00:00+09:00"),
        registerEnd: new Date("2024-04-30T17:00:00+09:00"),
        examDate: new Date("2024-05-25T10:00:00+09:00"),
        resultDate: new Date("2024-06-05T10:00:00+09:00"),
    },
    {
        round: 71,
        year: 2024,
        registerStart: new Date("2024-07-09T10:00:00+09:00"),
        registerEnd: new Date("2024-07-16T17:00:00+09:00"),
        examDate: new Date("2024-08-10T10:00:00+09:00"),
        resultDate: new Date("2024-08-22T10:00:00+09:00"),
    },
    {
        round: 72,
        year: 2024,
        registerStart: new Date("2024-09-10T10:00:00+09:00"),
        registerEnd: new Date("2024-09-17T17:00:00+09:00"),
        examDate: new Date("2024-10-20T10:00:00+09:00"),
        resultDate: new Date("2024-10-31T10:00:00+09:00"),
    },
    {
        round: 73,
        year: 2025,
        registerStart: new Date("2025-01-07T10:00:00+09:00"),
        registerEnd: new Date("2025-01-14T17:00:00+09:00"),
        examDate: new Date("2025-02-16T10:00:00+09:00"),
        resultDate: new Date("2025-02-27T10:00:00+09:00"),
    },
    {
        round: 74,
        year: 2025,
        registerStart: new Date("2025-04-22T10:00:00+09:00"),
        registerEnd: new Date("2025-04-29T17:00:00+09:00"),
        examDate: new Date("2025-05-24T10:00:00+09:00"),
        resultDate: new Date("2025-06-05T10:00:00+09:00"),
    },
    {
        round: 75,
        year: 2025,
        registerStart: new Date("2025-07-08T10:00:00+09:00"),
        registerEnd: new Date("2025-07-15T17:00:00+09:00"),
        examDate: new Date("2025-08-09T10:00:00+09:00"),
        resultDate: new Date("2025-08-21T10:00:00+09:00"),
    },
    {
        round: 76,
        year: 2025,
        registerStart: new Date("2025-09-16T10:00:00+09:00"),
        registerEnd: new Date("2025-09-23T17:00:00+09:00"),
        examDate: new Date("2025-10-18T10:00:00+09:00"),
        resultDate: new Date("2025-10-31T10:00:00+09:00"),
    },
];

interface RawScheduleData {
    round: number;
    year: number;
    registerStart: Date;
    registerEnd: Date;
    examDate: Date;
    resultDate: Date;
}

// 공식 웹사이트 시험일정 페이지에서 직접 크롤링 및 파싱
async function fetchAndParseOfficialSchedules(): Promise<RawScheduleData[]> {
    try {
        console.log("🌐 [Schedule Crawler] Requesting official exam schedule page...");
        const res = await fetch("https://www.historyexam.go.kr/pageLink.do?link=examSchedule", {
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

                    // 정규식: 연도, 월, 일, 시간, 분 추출
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
                    parsedSchedules.push({
                        round,
                        year: examDate.getFullYear(),
                        registerStart,
                        registerEnd,
                        examDate,
                        resultDate
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

// GET: 전체 시험 일정 목록 조회 (파싱 및 2024~2025 과거 데이터 결합 및 동적 상태 포함)
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const scheduleRepo = dataSource.getRepository(ExamSchedule);

        // DB 일정 데이터 확인
        let schedules = await scheduleRepo.find({ order: { round: "ASC" } });

        // 데이터가 69회부터 81회 이상까지 온전하게 있지 않은 경우 (개수 부족이거나 mock 데이터인 경우)
        // 공식 사이트 파싱 및 pastSeedData 머지하여 새로 구성
        const hasMockData = schedules.some(s => s.round >= 73 && s.round <= 76 && s.year === 2026); // 과거 회차인데 2026년으로 되어 있던 잔재
        const needsSync = schedules.length < 13 || hasMockData;

        if (needsSync) {
            console.log("🔄 [Schedule API] Syncing schedules from past seed data & official web site...");
            
            // 공식 사이트 데이터 파싱 시도
            const officialSchedules = await fetchAndParseOfficialSchedules();

            // pastSeedData와 officialSchedules 병합 (round 기준 중복 제거)
            const mergedMap = new Map<number, RawScheduleData>();
            
            // 과거 고정 시드 먼저 투입
            pastSeedData.forEach(item => {
                mergedMap.set(item.round, item);
            });

            // 공식 사이트에서 긁어온 것 덮어쓰거나 추가 (주로 2026년 이후 최신 일정)
            officialSchedules.forEach(item => {
                mergedMap.set(item.round, item);
            });

            const mergedList = Array.from(mergedMap.values()).sort((a, b) => a.round - b.round);

            if (mergedList.length > 0) {
                // 기존 일정 데이터 안전하게 전면 제거
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

        // 실시간으로 KST 기준 시험일정과 현재 시각을 비교하여 status 부여
        // now는 KST 기준의 한국 시각을 기준으로 Date 연산을 수행해야 함
        const now = new Date();

        let result = schedules.map(s => {
            // 시험일 종료 여부에 따른 상태 결정
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

