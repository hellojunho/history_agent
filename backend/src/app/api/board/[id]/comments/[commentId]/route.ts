import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardComment } from "@/entities/BoardPost";
import { verifyToken } from "@/lib/auth";

interface Params {
    params: {
        id: string;
        commentId: string;
    };
}

// DELETE: 댓글 삭제 (본인 또는 관리자)
export async function DELETE(request: Request, { params }: Params): Promise<NextResponse> {
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
        const commentRepository = dataSource.getRepository(BoardComment);

        const comment = await commentRepository.findOne({ where: { id: commentId } });
        if (!comment || comment.deletedAt) {
            return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 본인 또는 관리자만 삭제 가능
        if (comment.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 삭제 권한이 없습니다." }, { status: 403 });
        }

        // Soft Delete
        comment.deletedAt = new Date();
        await commentRepository.save(comment);

        return NextResponse.json({
            id: comment.id,
            message: "댓글이 성공적으로 삭제되었습니다."
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
