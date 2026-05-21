import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User, UserRole } from "@/entities/User";
import { verifyToken } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: { userId: string } }
): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? verifyToken(token) : null;

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin only" }, { status: 403 });
        }

        const { userId } = params;
        const { role }: { role: UserRole } = await request.json();

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.role = role;
        await userRepository.save(user);

        return NextResponse.json({ message: "User role updated", userId, role }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
