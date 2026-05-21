import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User } from "@/entities/User";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = userRepository.create({
            email,
            passwordHash: hashedPassword,
            role: "general",
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
