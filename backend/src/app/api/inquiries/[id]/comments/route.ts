import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Inquiry, InquiryComment } from "@/entities/Inquiry";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";
import { getMaskedNickname, logEmailAlarm } from "@/lib/inquiryHelper";

interface RouteParams {
    params: {
        id: string;
    };
}

// GET: 특정 문의글의 댓글 및 답글 목록 조회 (N+1 방지 조인 적용)
export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { id } = params;
        const dataSource = await initializeDatabase();
        const commentRepository = dataSource.getRepository(InquiryComment);

        // N+1 문제 방지를 위해 relations: ["user"] 사용하여 한 번의 쿼리로 Join 조회
        const comments = await commentRepository.find({
            where: { inquiryId: id },
            relations: ["user"],
            order: { createdAt: "ASC" }, // 댓글 및 답글은 오래된 순서대로 정렬하여 렌더링
        });

        // 사용자 이메일 노출 방지를 위해 DTO 매핑 단계에서 닉네임 마스킹 적용
        const maskedComments = comments.map((comment) => {
            const writer = comment.user;
            const nickname = getMaskedNickname(writer.email, writer.role);

            return {
                id: comment.id,
                content: comment.content,
                inquiryId: comment.inquiryId,
                userId: comment.userId,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                writer: {
                    nickname: nickname,
                    role: writer.role,
                },
            };
        });

        return NextResponse.json(maskedComments, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// POST: 댓글 또는 답글(대댓글) 생성 및 이메일 알림 시뮬레이션
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
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

        const { content, parentId } = await request.json();
        if (!content) {
            return NextResponse.json({ message: "댓글 내용을 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const inquiryRepository = dataSource.getRepository(Inquiry);
        const commentRepository = dataSource.getRepository(InquiryComment);
        const userRepository = dataSource.getRepository(User);

        // 1. 게시글 존재 여부 확인 (작성자 정보 포함)
        const inquiry = await inquiryRepository.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!inquiry || inquiry.deletedAt) {
            return NextResponse.json({ message: "문의글을 찾을 수 없습니다." }, { status: 404 });
        }

        // 2. 작성자 유저 확인
        const author = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!author || author.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 3. 댓글/답글 객체 생성 및 저장
        const newComment = commentRepository.create({
            content,
            inquiryId: id,
            inquiry: inquiry,
            userId: author.id,
            user: author,
            parentId: parentId || null,
        });

        await commentRepository.save(newComment);

        // ------------------ 이메일 알림 로깅 시뮬레이션 ------------------
        const authorNickname = getMaskedNickname(author.email, author.role);

        // 가. 게시글 작성자에게 새 답변/댓글 알림 발송 (단, 글쓴이 본인의 작성은 제외)
        if (inquiry.userId !== author.id) {
            logEmailAlarm(
                inquiry.user.email,
                getMaskedNickname(inquiry.user.email, inquiry.user.role),
                "inquiry_comment",
                inquiry.title
            );
        }

        // 나. 답글인 경우, 부모 댓글 작성자에게 대댓글 알림 발송
        let parentComment: InquiryComment | null = null;
        if (parentId) {
            parentComment = await commentRepository.findOne({
                where: { id: parentId },
                relations: ["user"],
            });

            if (parentComment && parentComment.userId !== author.id) {
                logEmailAlarm(
                    parentComment.user.email,
                    getMaskedNickname(parentComment.user.email, parentComment.user.role),
                    "comment_reply",
                    inquiry.title
                );
            }
        }

        // 다. 내용(content)에서 @닉네임 태그를 파싱하여 이메일 알림 발송
        // 정규식으로 @로 시작하고 띄어쓰기 전까지의 닉네임을 파싱 (예: @test**** 또는 @관리자)
        const tagRegex = /@([a-zA-Z0-9가-힣*]+)/g;
        let match;
        const taggedNicknames: string[] = [];
        while ((match = tagRegex.exec(content)) !== null) {
            const nickname = match[1];
            if (nickname && !taggedNicknames.includes(nickname)) {
                taggedNicknames.push(nickname);
            }
        }

        if (taggedNicknames.length > 0) {
            // DB 내 모든 활성 사용자를 가져와 닉네임을 비교 매칭 (TypeORM이 자동으로 deletedAt IS NULL 적용)
            const allUsers = await userRepository.find();
            for (const user of allUsers) {
                const userNickname = getMaskedNickname(user.email, user.role);
                // 태그된 닉네임 목록에 이 유저의 마스킹 닉네임이 있고, 알림 발송자가 아닌 경우
                if (taggedNicknames.includes(userNickname) && user.id !== author.id) {
                    // 가 및 나에서 이미 발송한 경우 중복 발송을 피하기 위함
                    const isAlreadySent = 
                        (inquiry.userId === user.id && inquiry.userId !== author.id) ||
                        (parentComment && parentComment.userId === user.id && parentComment.userId !== author.id);

                    if (!isAlreadySent) {
                        logEmailAlarm(user.email, userNickname, "tag", inquiry.title);
                    }
                }
            }
        }
        // -----------------------------------------------------------------

        return NextResponse.json({
            id: newComment.id,
            content: newComment.content,
            message: "댓글이 등록되었습니다.",
            writer: {
                nickname: authorNickname,
                role: author.role,
            }
        }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
