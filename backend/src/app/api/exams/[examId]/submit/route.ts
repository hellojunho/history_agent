import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Question } from "@/entities/Question";
import { UserExamResult } from "@/entities/UserExamResult";
import { UserAnswer } from "@/entities/UserAnswer";
import { verifyToken } from "@/lib/auth";

interface AnswerSubmission {
    questionId: string;
    selectedAnswer: number;
}

interface ScoringResult {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string | null;
}

export async function POST(
    request: Request,
    { params }: { params: { examId: string } }
): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? verifyToken(token) : null;

        // Optionally allow anonymous submission but don't save to DB if so.
        // For now, let's keep unauthorized error or handle anonymous gracefully.
        
        const { examId } = params;
        const { answers, timeTakenSeconds }: { answers: AnswerSubmission[], timeTakenSeconds?: number } = await request.json();

        const dataSource = await initializeDatabase();
        const questionRepository = dataSource.getRepository(Question);
        
        const questions = await questionRepository.find({ where: { examId } });
        
        let correctCount = 0;
        const results: ScoringResult[] = answers.map((sub) => {
            const question = questions.find((q) => q.id === sub.questionId);
            const isCorrect = question ? question.answer === sub.selectedAnswer : false;
            if (isCorrect) correctCount++;

            return {
                questionId: sub.questionId,
                isCorrect,
                correctAnswer: question?.answer || 0,
                explanation: question?.explanation || null,
            };
        });

        const score = Math.round((correctCount / questions.length) * 100) || 0;

        if (decoded) {
            const resultRepository = dataSource.getRepository(UserExamResult);
            const answerRepository = dataSource.getRepository(UserAnswer);

            const newResult = resultRepository.create({
                userId: decoded.userId,
                examId,
                score,
                totalAnswers: answers.length,
                correctAnswers: correctCount,
                timeTakenSeconds: timeTakenSeconds || 0,
            });
            const savedResult = await resultRepository.save(newResult);

            const userAnswers = answers.map(sub => {
                const question = questions.find(q => q.id === sub.questionId);
                const isCorrect = question ? question.answer === sub.selectedAnswer : false;
                return answerRepository.create({
                    userExamResultId: savedResult.id,
                    questionId: sub.questionId,
                    selectedChoice: sub.selectedAnswer,
                    isCorrect
                });
            });
            await answerRepository.save(userAnswers);
        }

        return NextResponse.json({
            score,
            passed: score >= 60, // 예시 기준
            results,
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
