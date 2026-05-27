import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { SystemSetting } from "@/entities/SystemSetting";
import { verifyToken } from "@/lib/auth";
import { User } from "@/entities/User";

const COOLDOWN_OPTIONS = ["None", "1일", "1주일", "1달", "3달"];

// Helper: 관리자 권한 체크
async function checkAdmin(request: Request): Promise<User | null> {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user || user.deletedAt || user.role !== "admin") {
        return null;
    }
    return user;
}

// GET: 관리자 설정 조회
export async function GET(request: Request): Promise<NextResponse> {
    try {
        const isAdmin = await checkAdmin(request);
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const dataSource = await initializeDatabase();
        const settingRepository = dataSource.getRepository(SystemSetting);
        
        let cooldownSetting = await settingRepository.findOne({ where: { key: "nickname_change_cooldown" } });
        if (!cooldownSetting) {
            cooldownSetting = settingRepository.create({
                key: "nickname_change_cooldown",
                value: "None"
            });
            await settingRepository.save(cooldownSetting);
        }

        return NextResponse.json({
            nicknameChangeCooldown: cooldownSetting.value
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// POST: 관리자 설정 갱신
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const isAdmin = await checkAdmin(request);
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { nicknameChangeCooldown } = await request.json();
        if (!nicknameChangeCooldown || !COOLDOWN_OPTIONS.includes(nicknameChangeCooldown)) {
            return NextResponse.json({ message: "올바른 설정 옵션을 지정해 주세요. (None, 1일, 1주일, 1달, 3달)" }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const settingRepository = dataSource.getRepository(SystemSetting);
        
        let cooldownSetting = await settingRepository.findOne({ where: { key: "nickname_change_cooldown" } });
        if (!cooldownSetting) {
            cooldownSetting = settingRepository.create({
                key: "nickname_change_cooldown",
                value: nicknameChangeCooldown
            });
        } else {
            cooldownSetting.value = nicknameChangeCooldown;
        }

        await settingRepository.save(cooldownSetting);

        return NextResponse.json({
            message: "설정이 성공적으로 저장되었습니다.",
            nicknameChangeCooldown: cooldownSetting.value
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
