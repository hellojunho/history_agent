import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Exam } from "@/entities/Exam";

export async function GET(): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const examRepository = dataSource.getRepository(Exam);

        const exams = await examRepository.find({
            order: { roundNumber: "DESC" }
        });

        return NextResponse.json({ data: exams }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
