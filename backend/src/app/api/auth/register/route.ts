import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User } from "@/entities/User";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { email, password, hanneunggeomId, hanneunggeomPassword } = await request.json();

        if (!email || !password || !hanneunggeomId) {
            return NextResponse.json({ message: "이메일, 비밀번호, 한능검 아이디는 필수 입력 사항입니다." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return NextResponse.json({ message: "이미 존재하는 이메일입니다." }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = userRepository.create({
            email,
            passwordHash: hashedPassword,
            role: "general",
            hanneunggeomId,
            hanneunggeomPassword: hanneunggeomPassword || null,
        });

        await userRepository.save(newUser);

        return NextResponse.json({
            message: "User successfully registered.",
            userId: newUser.id,
        }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
