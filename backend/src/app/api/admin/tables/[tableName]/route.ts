import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { requireAdmin } from "@/lib/adminAuth";
import { User } from "@/entities/User";
import { Exam } from "@/entities/Exam";
import { Question } from "@/entities/Question";
import { UserExamResult } from "@/entities/UserExamResult";
import { UserAnswer } from "@/entities/UserAnswer";
import { Material } from "@/entities/Material";

import { hashPassword } from "@/lib/auth";

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

export async function GET(request: Request, { params }: { params: { tableName: string } }) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const repo = await getRepositoryByTableName(params.tableName);
        if (!repo) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        const data = await repo.find({ take: 100 }); // Limit to 100 for safety, could add pagination later
        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tableName: string } }) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const repo = await getRepositoryByTableName(params.tableName);
        if (!repo) return NextResponse.json({ message: "Table not found" }, { status: 404 });

        let body = await request.json();

        if (params.tableName === "user") {
            if (!body.email || !body.password) {
                return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
            }
            const existingUser = await repo.findOneBy({ email: body.email });
            if (existingUser) {
                return NextResponse.json({ message: "User already exists" }, { status: 409 });
            }
            const hashedPassword = await hashPassword(body.password);
            body = {
                email: body.email,
                passwordHash: hashedPassword,
                role: body.role || "general",
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newEntity = (repo as any).create(body);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedEntity = await (repo as any).save(newEntity);

        return NextResponse.json(savedEntity, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
