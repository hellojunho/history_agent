import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardPost } from "@/entities/BoardPost";
import { verifyToken } from "@/lib/auth";
import { getMaskedNickname } from "@/lib/inquiryHelper";

interface Params {
    params: {
        id: string;
    };
}

// GET: 특정 게시글 상세 조회 (댓글 리스트 및 좋아요 여부 포함)
export async function GET(request: Request, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = params;
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        let currentUserId: string | null = null;
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                currentUserId = decoded.userId;
            }
        }

        const dataSource = await initializeDatabase();
        const boardRepository = dataSource.getRepository(BoardPost);

        const post = await boardRepository.findOne({
            where: { id },
            relations: ["user", "comments", "comments.user", "likes", "likes.user"],
        });

        if (!post || post.deletedAt) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        const writer = post.user;
        const nickname = writer.nickname || getMaskedNickname(writer.email, writer.role);

        // 댓글 DTO 매핑 (삭제되지 않은 댓글 대상)
        const comments = (post.comments || [])
            .filter((c) => !c.deletedAt)
            .map((comment) => {
                const commentWriter = comment.user;
                const commentNickname = commentWriter.nickname || getMaskedNickname(commentWriter.email, commentWriter.role);
                return {
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    writer: {
                        id: commentWriter.id,
                        nickname: commentNickname,
                        profileImage: commentWriter.profileImage,
                        role: commentWriter.role,
                    },
                };
            })
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // 댓글 오래된순 정렬

        const isLiked = currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false;

        return NextResponse.json({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount: comments.length,
            likeCount: post.likes.length,
            isLiked,
            writer: {
                id: writer.id,
                nickname: nickname,
                profileImage: writer.profileImage,
                role: writer.role,
            },
            comments,
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// PUT: 게시글 수정 (본인 전용)
export async function PUT(request: Request, { params }: Params): Promise<NextResponse> {
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

        const { title, content, imageUrl } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const boardRepository = dataSource.getRepository(BoardPost);

        const post = await boardRepository.findOne({ where: { id } });
        if (!post || post.deletedAt) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 본인만 수정 가능
        if (post.userId !== decoded.userId) {
            return NextResponse.json({ message: "Forbidden: 본인 글만 수정할 수 있습니다." }, { status: 403 });
        }

        post.title = title;
        post.content = content;
        if (imageUrl !== undefined) {
            post.imageUrl = imageUrl;
        }
        await boardRepository.save(post);

        return NextResponse.json({
            id: post.id,
            message: "게시글이 성공적으로 수정되었습니다."
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// DELETE: 게시글 삭제 (본인 또는 관리자)
export async function DELETE(request: Request, { params }: Params): Promise<NextResponse> {
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
        const boardRepository = dataSource.getRepository(BoardPost);

        const post = await boardRepository.findOne({ where: { id } });
        if (!post || post.deletedAt) {
            return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 권한 확인: 본인 또는 관리자만 삭제 가능
        if (post.userId !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: 삭제 권한이 없습니다." }, { status: 403 });
        }

        // Soft Delete
        post.deletedAt = new Date();
        await boardRepository.save(post);

        return NextResponse.json({
            id: post.id,
            message: "게시글이 성공적으로 삭제되었습니다."
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
