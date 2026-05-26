import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User } from "@/entities/User";
import { verifyToken, comparePassword, hashPassword } from "@/lib/auth";

// GET: 프로필 반환
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
        const userRepository = dataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// PUT: 회원정보 (비밀번호) 수정
export async function PUT(request: Request): Promise<NextResponse> {
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

        const { currentPassword, newPassword } = await request.json();
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ message: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
        }

        user.passwordHash = await hashPassword(newPassword);
        await userRepository.save(user);

        return NextResponse.json({ message: "비밀번호가 성공적으로 수정되었습니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// DELETE: 회원 탈퇴 (소프트 딜리트)
export async function DELETE(request: Request): Promise<NextResponse> {
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
        const userRepository = dataSource.getRepository(User);
        
        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user || user.deletedAt) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 회원 탈퇴 처리: 비활성화 상태 부여 및 탈퇴 시간, 수정 시간 갱신
        user.isActivate = false;
        user.deletedAt = new Date();
        await userRepository.save(user);

        return NextResponse.json({ message: "회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다." }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
