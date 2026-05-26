import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardPost } from "@/entities/BoardPost";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";
import { getMaskedNickname } from "@/lib/inquiryHelper";

// GET: 게시글 목록 조회 (정렬 기능 지원)
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const sort = searchParams.get("sort") || "latest"; // latest or likes

        const dataSource = await initializeDatabase();
        const boardRepository = dataSource.getRepository(BoardPost);

        const posts = await boardRepository.find({
            relations: ["user", "comments", "likes"],
            order: { createdAt: "DESC" },
        });

        // DTO 매핑
        const mappedPosts = posts.map((post) => {
            const writer = post.user;
            const nickname = writer.nickname || getMaskedNickname(writer.email, writer.role);

            return {
                id: post.id,
                title: post.title,
                content: post.content,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                commentCount: post.comments.length,
                likeCount: post.likes.length,
                writer: {
                    id: writer.id,
                    nickname: nickname,
                    profileImage: writer.profileImage,
                    role: writer.role,
                },
            };
        });

        // 정렬 지원 (likes인 경우 좋아요 많은 순, 동일하면 최신순)
        if (sort === "likes") {
            mappedPosts.sort((a, b) => b.likeCount - a.likeCount);
        }

        return NextResponse.json(mappedPosts, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// POST: 신규 게시글 생성
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

        const { title, content, imageUrl } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const boardRepository = dataSource.getRepository(BoardPost);
        const userRepository = dataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newPost = boardRepository.create({
            title,
            content,
            imageUrl: imageUrl || null,
            userId: user.id,
            user: user,
        });

        await boardRepository.save(newPost);

        return NextResponse.json({
            id: newPost.id,
            title: newPost.title,
            message: "게시글이 성공적으로 등록되었습니다."
        }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
