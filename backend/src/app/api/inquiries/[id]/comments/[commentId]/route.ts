import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { InquiryComment } from "@/entities/Inquiry";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
    params: {
        id: string;
        commentId: string;
    };
}

// PUT: 댓글/답글 수정 (댓글 작성자 또는 관리자만 가능)
export async function PUT(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { commentId } = params;
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized: 로그인이 필요합니다." }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized: 유효하지 않은 토큰입니다." }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content) {
            return NextResponse.json({ message: "댓글 내용을 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const commentRepository = dataSource.getRepository(InquiryComment);

        const comment = await commentRepository.findOne({
            where: { id: commentId },
            relations: ["user"],
        });

        if (!comment || comment.deletedAt) {
            return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 댓글 작성자 또는 관리자만 수정 가능
        if (comment.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 수정 권한이 없습니다." }, { status: 403 });
        }

        comment.content = content;
        await commentRepository.save(comment);

        return NextResponse.json({ message: "댓글이 수정되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// DELETE: 댓글/답글 삭제 (댓글 작성자 또는 관리자만 가능, Soft Delete 적용)
export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { commentId } = params;
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
        const commentRepository = dataSource.getRepository(InquiryComment);

        const comment = await commentRepository.findOne({
            where: { id: commentId },
            relations: ["user"],
        });

        if (!comment || comment.deletedAt) {
            return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 댓글 작성자 또는 관리자만 삭제 가능
        if (comment.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 삭제 권한이 없습니다." }, { status: 403 });
        }

        // Soft Delete 실행
        await commentRepository.softRemove(comment);

        return NextResponse.json({ message: "댓글이 삭제되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
