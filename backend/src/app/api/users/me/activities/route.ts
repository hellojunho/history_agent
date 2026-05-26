import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { BoardPost, BoardComment, BoardLike } from "@/entities/BoardPost";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "all"; // all, post, comment, like
        const sort = url.searchParams.get("sort") || "latest"; // latest, oldest

        const dataSource = await initializeDatabase();
        const postRepository = dataSource.getRepository(BoardPost);
        const commentRepository = dataSource.getRepository(BoardComment);
        const likeRepository = dataSource.getRepository(BoardLike);

        interface ActivityItem {
            id: string;
            type: "post" | "comment" | "like";
            title: string;
            content: string;
            createdAt: Date;
            postId: string;
            commentCount: number;
            likeCount: number;
        }

        let activities: ActivityItem[] = [];

        if (type === "all" || type === "post") {
            const posts = await postRepository.find({
                where: { userId: decoded.userId },
                relations: ["comments", "likes"]
            });
            const formattedPosts = posts.map(post => ({
                id: post.id,
                type: "post" as const,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                postId: post.id,
                commentCount: post.comments?.length || 0,
                likeCount: post.likes?.length || 0
            }));
            activities = [...activities, ...formattedPosts];
        }

        if (type === "all" || type === "comment") {
            const comments = await commentRepository.find({
                where: { userId: decoded.userId },
                relations: ["post"]
            });
            const formattedComments = comments
                .filter(comment => comment.post) // 원본 게시글이 온전히 존재하는 경우만 필터링
                .map(comment => ({
                    id: comment.id,
                    type: "comment" as const,
                    title: comment.post?.title || "삭제된 게시글",
                    content: comment.content,
                    createdAt: comment.createdAt,
                    postId: comment.postId,
                    commentCount: 0,
                    likeCount: 0
                }));
            activities = [...activities, ...formattedComments];
        }

        if (type === "all" || type === "like") {
            const likes = await likeRepository.find({
                where: { userId: decoded.userId },
                relations: ["post"]
            });
            const formattedLikes = likes
                .filter(like => like.post) // 원본 게시글이 온전히 존재하는 경우만 필터링
                .map(like => ({
                    id: like.id,
                    type: "like" as const,
                    title: like.post?.title || "삭제된 게시글",
                    content: "이 게시글을 좋아합니다.",
                    createdAt: like.createdAt,
                    postId: like.postId,
                    commentCount: 0,
                    likeCount: 0
                }));
            activities = [...activities, ...formattedLikes];
        }

        // 정렬 수행
        activities.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sort === "latest" ? timeB - timeA : timeA - timeB;
        });

        return NextResponse.json(activities, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
