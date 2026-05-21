import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Question } from "@/entities/Question";

export async function GET(
    request: Request,
    { params }: { params: { examId: string } }
): Promise<NextResponse> {
    try {
        const { examId } = params;
        const dataSource = await initializeDatabase();
        const questionRepository = dataSource.getRepository(Question);

        const questions = await questionRepository.find({
            where: { examId },
            // select: ["id", "questionNumber", "contentText", "imageUrl"], -> removed to return all necessary columns for one-by-one check
            order: { questionNumber: "ASC" }
        });

        return NextResponse.json({
            examId,
            questions,
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
