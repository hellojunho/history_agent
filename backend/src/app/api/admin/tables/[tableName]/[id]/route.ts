import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { requireAdmin } from "@/lib/adminAuth";
import { User } from "@/entities/User";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";
import { UserExamResult } from "@/entities/UserExamResult";
import { UserAnswer } from "@/entities/UserAnswer";
import { Material } from "@/entities/Material";

const getRepositoryByTableName = async (tableName: string) => {
    const dataSource = await initializeDatabase();
    switch (tableName) {
        case "user": return dataSource.getRepository(User);
        case "exam": return dataSource.getRepository(Exam);
        case "question": return dataSource.getRepository(Question);
        case "userexamresult": return dataSource.getRepository(UserExamResult);
        case "useranswer": return dataSource.getRepository(UserAnswer);
        case "material": return dataSource.getRepository(Material);
        default: return null;
    }
};

export async function GET(request: Request, { params }: { params: { tableName: string, id: string } }) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const repo = await getRepositoryByTableName(params.tableName);
        if (!repo) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await repo.findOne({ where: { id: params.id } as unknown as any });
        if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });

        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { tableName: string, id: string } }) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const repo = await getRepositoryByTableName(params.tableName);
        if (!repo) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        const body = await request.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await repo.findOne({ where: { id: params.id } as unknown as any });
        if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedData = (repo as any).merge(data, body);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedData = await (repo as any).save(updatedData);

        return NextResponse.json(savedData, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { tableName: string, id: string } }) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const repo = await getRepositoryByTableName(params.tableName);
        if (!repo) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await repo.findOne({ where: { id: params.id } as any });
        if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });

        // Prefer soft remove if entity supports it (User has deletedAt)
        if (params.tableName === "user") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (repo as any).softRemove(data);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (repo as any).remove(data);
        }

        return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
