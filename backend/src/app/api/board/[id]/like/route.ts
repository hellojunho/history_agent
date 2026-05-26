import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardPost, BoardLike } from "@/entities/BoardPost";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";

interface Params {
    params: {
        id: string;
    };
}

// POST: 특정 게시글 좋아요 토글
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

        const dataSource = await initializeDatabase();
        const boardRepository = dataSource.getRepository(BoardPost);
        const likeRepository = dataSource.getRepository(BoardLike);
        const userRepository = dataSource.getRepository(User);

        const post = await boardRepository.findOne({ where: { id: postId } });
        if (!post || post.deletedAt) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 이미 좋아요를 눌렀는지 확인
        const existingLike = await likeRepository.findOne({
            where: { postId, userId: user.id },
        });

        let isLiked = false;
        if (existingLike) {
            // 이미 존재하면 삭제 (Unlike)
            await likeRepository.remove(existingLike);
            isLiked = false;
        } else {
            // 존재하지 않으면 생성 (Like)
            const newLike = likeRepository.create({
                postId,
                post,
                userId: user.id,
                user,
            });
            await likeRepository.save(newLike);
            isLiked = true;
        }

        // 업데이트된 총 좋아요 개수 조회
        const likeCount = await likeRepository.count({ where: { postId } });

        return NextResponse.json({
            isLiked,
            likeCount,
            message: isLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.",
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
