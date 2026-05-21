import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { ExamNotification } from "@/entities/ExamNotification";
import { ExamSchedule } from "@/entities/ExamSchedule";
import { verifyToken } from "@/lib/auth";

// POST: 특정 시험 일정에 대한 알람 신청
export async function POST(
    request: Request,
    { params }: { params: { scheduleId: string } }
): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "유효하지 않은 토큰입니다." }, { status: 401 });
        }

        const scheduleId = parseInt(params.scheduleId);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ message: "잘못된 시험 일정 식별자입니다." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const scheduleRepo = dataSource.getRepository(ExamSchedule);
        const notifRepo = dataSource.getRepository(ExamNotification);

        const schedule = await scheduleRepo.findOneBy({ id: scheduleId });
        if (!schedule) {
            return NextResponse.json({ message: "존재하지 않는 시험 일정입니다." }, { status: 404 });
        }

        const existing = await notifRepo.findOne({
            where: { userId: decoded.userId, scheduleId }
        });

        if (existing) {
            return NextResponse.json({ message: "이미 알림을 구독 중인 시험 일정입니다." }, { status: 400 });
        }

        const notification = notifRepo.create({
            userId: decoded.userId,
            scheduleId,
            sentStart: false,
            sentD7: false,
            sentDday: false,
        });

        await notifRepo.save(notification);

        return NextResponse.json({ message: "성공적으로 알림이 신청되었습니다." }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// DELETE: 특정 시험 일정에 대한 알람 취소
export async function DELETE(
    request: Request,
    { params }: { params: { scheduleId: string } }
): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "유효하지 않은 토큰입니다." }, { status: 401 });
        }

        const scheduleId = parseInt(params.scheduleId);
        if (isNaN(scheduleId)) {
            return NextResponse.json({ message: "잘못된 시험 일정 식별자입니다." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const notifRepo = dataSource.getRepository(ExamNotification);

        const subscription = await notifRepo.findOne({
            where: { userId: decoded.userId, scheduleId }
        });

        if (!subscription) {
            return NextResponse.json({ message: "알림을 구독하고 있지 않은 시험 일정입니다." }, { status: 400 });
        }

        await notifRepo.remove(subscription);

        return NextResponse.json({ message: "성공적으로 알림 신청이 취소되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
