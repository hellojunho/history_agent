import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Inquiry } from "@/entities/Inquiry";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";
import { getMaskedNickname } from "@/lib/inquiryHelper";

// GET: 모든 문의사항 목록 조회 (N+1 방지 조인 적용)
export async function GET(): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);

        // N+1 문제 방지를 위해 relations: ["user"] 사용하여 한 번의 쿼리로 Join 조회
        const inquiries = await inquiryRepository.find({
            relations: ["user"],
            order: { createdAt: "DESC" },
        });

        // 사용자 이메일 노출 방지를 위해 DTO 매핑 단계에서 마스킹 및 도메인 제거 처리
        const maskedInquiries = inquiries.map((inquiry) => {
            const writer = inquiry.user;
            const nickname = getMaskedNickname(writer.email, writer.role);

            return {
                id: inquiry.id,
                title: inquiry.title,
                content: inquiry.content,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                writer: {
                    nickname: nickname,
                    role: writer.role,
                },
            };
        });

        return NextResponse.json(maskedInquiries, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// POST: 신규 문의글 생성
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized: 로그인이 필요합니다." }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized: 유효하지 않은 토큰입니다." }, { status: 401 });
        }

        const { title, content } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);
        const userRepository = dataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newInquiry = inquiryRepository.create({
            title,
            content,
            userId: user.id,
            user: user,
        });

        await inquiryRepository.save(newInquiry);

        return NextResponse.json({
            id: newInquiry.id,
            title: newInquiry.title,
            message: "문의글이 성공적으로 등록되었습니다."
        }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
