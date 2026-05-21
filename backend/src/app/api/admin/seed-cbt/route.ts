import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";

// 시험 데이터 구조 (JSON Upload)
interface ImportQuestion {
    questionNumber: number;
    contentText: string | null;
    imageUrl: string | null;
    choices: string[];
    answer: number;
    explanation: string;
    wrongExplanations: Record<string, string>;
    era: string | null;
    topic: string | null;
    difficulty: string | null;
    frequentConcept: boolean;
    sourceUrl: string | null;
}

interface ImportExamData {
    year: number;
    roundNumber: number;
    level: string;
    title: string;
    examDate: string;
    totalQuestions: number;
    sourceUrl: string;
    pdfFilePath: string | null;
    questions: ImportQuestion[];
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload: ImportExamData = await request.json();
        
        const dataSource = await initializeDatabase();
        const examRepository = dataSource.getRepository(Exam);
        const questionRepository = dataSource.getRepository(Question);

        // 중복 시험 검사 (연도, 회차, 등급이 같으면 중복으로 간주)
        let exam = await examRepository.findOne({
            where: { 
                year: payload.year, 
                roundNumber: payload.roundNumber,
                level: payload.level 
            }
        });

        if (exam) {
            return NextResponse.json({ message: "동일한 연도, 회차, 등급의 시험이 이미 존재합니다. 업데이트를 지원하지 않습니다." }, { status: 409 });
        }

        // 시험 생성
        exam = examRepository.create({
            year: payload.year,
            roundNumber: payload.roundNumber,
            level: payload.level,
            title: payload.title,
            examDate: new Date(payload.examDate),
            totalQuestions: payload.totalQuestions,
            status: "published",
            sourceUrl: payload.sourceUrl,
            pdfFilePath: payload.pdfFilePath,
        });
        const savedExam = await examRepository.save(exam);

        // 질문 생성
        const questionsToSave = payload.questions.map(q => 
            questionRepository.create({
                examId: savedExam.id,
                questionNumber: q.questionNumber,
                contentText: q.contentText,
                imageUrl: q.imageUrl,
                choices: q.choices,
                answer: q.answer,
                explanation: q.explanation,
                wrongExplanations: q.wrongExplanations,
                era: q.era,
                topic: q.topic,
                difficulty: q.difficulty,
                frequentConcept: q.frequentConcept,
                sourceUrl: q.sourceUrl || payload.sourceUrl
            })
        );

        await questionRepository.save(questionsToSave);

        return NextResponse.json({ message: "시험 데이터가 성공적으로 등록/수집되었습니다." }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
