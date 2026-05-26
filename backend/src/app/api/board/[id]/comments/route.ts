import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardPost, BoardComment } from "@/entities/BoardPost";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";

interface Params {
    params: {
        id: string;
    };
}

// POST: 특정 게시글에 댓글 등록
export async function POST(request: Request, { params }: Params): Promise<NextResponse> {
    try {
        const { id: postId } = params;
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
        const boardRepository = dataSource.getRepository(BoardPost);
        const commentRepository = dataSource.getRepository(BoardComment);
        const userRepository = dataSource.getRepository(User);

        const post = await boardRepository.findOne({ where: { id: postId } });
        if (!post || post.deletedAt) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newComment = commentRepository.create({
            content,
            postId,
            post,
            userId: user.id,
            user,
        });

        await commentRepository.save(newComment);

        return NextResponse.json({
            id: newComment.id,
            content: newComment.content,
            message: "댓글이 성공적으로 등록되었습니다."
        }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
