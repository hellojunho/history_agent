import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { ExamSchedule } from "@/entities/ExamSchedule";
import { ExamNotification } from "@/entities/ExamNotification";
import { verifyToken } from "@/lib/auth";

// GET: 전체 시험 일정 목록 조회 (자동 시딩 포함)
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const scheduleRepo = dataSource.getRepository(ExamSchedule);

        // 일정 데이터 확인
        let schedules = await scheduleRepo.find({ order: { round: "ASC" } });

        // 데이터가 비어 있거나 이전의 mock 데이터(73-76회)인 경우 또는 개수가 안 맞으면 정확한 2026년 일정(77-81회)으로 전면 교정
        const hasMockData = schedules.some(s => s.round < 77);
        if (schedules.length !== 5 || hasMockData) {
            console.log("🔄 [Schedule API] Seeding/Updating DB with exact 2026 official exam schedules (77-81th)...");
            
            // 기존 잘못된 일정 데이터 제거
            await scheduleRepo.clear();

            const seedData = [
                {
                    round: 77,
                    year: 2026,
                    registerStart: new Date("2026-01-06T10:00:00+09:00"),
                    registerEnd: new Date("2026-01-13T17:00:00+09:00"),
                    examDate: new Date("2026-02-07T10:00:00+09:00"),
                    resultDate: new Date("2026-02-20T10:00:00+09:00"),
                },
                {
                    round: 78,
                    year: 2026,
                    registerStart: new Date("2026-04-21T10:00:00+09:00"),
                    registerEnd: new Date("2026-04-28T17:00:00+09:00"),
                    examDate: new Date("2026-05-23T10:00:00+09:00"),
                    resultDate: new Date("2026-06-05T10:00:00+09:00"),
                },
                {
                    round: 79,
                    year: 2026,
                    registerStart: new Date("2026-07-07T10:00:00+09:00"),
                    registerEnd: new Date("2026-07-14T17:00:00+09:00"),
                    examDate: new Date("2026-08-09T10:00:00+09:00"),
                    resultDate: new Date("2026-08-21T10:00:00+09:00"),
                },
                {
                    round: 80,
                    year: 2026,
                    registerStart: new Date("2026-09-15T10:00:00+09:00"),
                    registerEnd: new Date("2026-09-22T17:00:00+09:00"),
                    examDate: new Date("2026-10-17T10:00:00+09:00"),
                    resultDate: new Date("2026-10-30T10:00:00+09:00"),
                },
                {
                    round: 81,
                    year: 2026,
                    registerStart: new Date("2026-11-03T10:00:00+09:00"),
                    registerEnd: new Date("2026-11-10T17:00:00+09:00"),
                    examDate: new Date("2026-11-28T10:00:00+09:00"),
                    resultDate: new Date("2026-12-11T10:00:00+09:00"),
                }
            ];

            const entities = scheduleRepo.create(seedData);
            await scheduleRepo.save(entities);
            schedules = await scheduleRepo.find({ order: { round: "ASC" } });
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

        let result = schedules.map(s => ({
            ...s,
            isSubscribed: false,
        }));

        if (userId) {
            const notifRepo = dataSource.getRepository(ExamNotification);
            const subscriptions = await notifRepo.find({ where: { userId } });
            const subIds = new Set(subscriptions.map(sub => sub.scheduleId));

            result = schedules.map(s => ({
                ...s,
                isSubscribed: subIds.has(s.id),
            }));
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
