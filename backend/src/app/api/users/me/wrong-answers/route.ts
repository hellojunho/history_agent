import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { UserAnswer } from "@/entities/UserAnswer";
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

        const dataSource = await initializeDatabase();
        const answerRepository = dataSource.getRepository(UserAnswer);

        // 오답만 조회, 해당 Question 조인
        const wrongAnswers = await answerRepository.find({
            where: {
                userExamResult: { userId: decoded.userId },
                isCorrect: false
            },
            relations: ["question", "question.exam"],
            order: { answeredAt: "DESC" }
        });

        return NextResponse.json({ data: wrongAnswers }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
