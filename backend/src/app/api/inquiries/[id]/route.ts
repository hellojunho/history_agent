import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Inquiry } from "@/entities/Inquiry";
import { verifyToken } from "@/lib/auth";
import { getMaskedNickname } from "@/lib/inquiryHelper";

interface RouteParams {
    params: {
        id: string;
    };
}

// GET: 특정 문의사항 상세 조회 (N+1 방지 조인 적용)
export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { id } = params;
        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);

        const inquiry = await inquiryRepository.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!inquiry || inquiry.deletedAt) {
            return NextResponse.json({ message: "문의글을 찾을 수 없습니다." }, { status: 404 });
        }

        const writer = inquiry.user;
        const nickname = getMaskedNickname(writer.email, writer.role);

        return NextResponse.json({
            id: inquiry.id,
            title: inquiry.title,
            content: inquiry.content,
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt,
            writer: {
                id: writer.id,
                nickname: nickname,
                role: writer.role,
            },
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// PUT: 문의글 수정 (글 작성자 또는 관리자만 가능)
export async function PUT(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { id } = params;
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
            return NextResponse.json({ message: "제목과 내용을 모두 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);

        const inquiry = await inquiryRepository.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!inquiry || inquiry.deletedAt) {
            return NextResponse.json({ message: "문의글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 글 작성자 또는 관리자만 수정 가능
        if (inquiry.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 수정 권한이 없습니다." }, { status: 403 });
        }

        inquiry.title = title;
        inquiry.content = content;
        await inquiryRepository.save(inquiry);

        return NextResponse.json({ message: "문의글이 성공적으로 수정되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// DELETE: 문의글 삭제 (글 작성자 또는 관리자만 가능, Soft Delete 적용)
export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { id } = params;
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized: 로그인이 필요합니다." }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized: 유효하지 않은 토큰입니다." }, { status: 401 });
        }

        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);

        const inquiry = await inquiryRepository.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!inquiry || inquiry.deletedAt) {
            return NextResponse.json({ message: "문의글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 글 작성자 또는 관리자만 삭제 가능
        if (inquiry.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 삭제 권한이 없습니다." }, { status: 403 });
        }

        // Soft Delete 실행
        await inquiryRepository.softRemove(inquiry);

        return NextResponse.json({ message: "문의글이 성공적으로 삭제되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
