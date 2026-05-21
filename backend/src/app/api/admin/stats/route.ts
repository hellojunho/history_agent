import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User } from "@/entities/User";
import { UserLoginLog } from "@/entities/UserLoginLog";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const dataSource = await initializeDatabase();
        const userRepository = dataSource.getRepository(User);
        const loginLogRepository = dataSource.getRepository(UserLoginLog);

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const getStatsForDate = async (startDate: Date | null) => {
            // Better to use queryBuilder to include soft-deleted users if they exist
            const qbUser = userRepository.createQueryBuilder("user").withDeleted();
            if (startDate) {
                qbUser.andWhere("user.created_at >= :startDate", { startDate });
            }
            const newUsersCount = await qbUser.getCount();

            const qbDeleted = userRepository.createQueryBuilder("user").withDeleted().where("user.deleted_at IS NOT NULL");
            if (startDate) {
                qbDeleted.andWhere("user.deleted_at >= :startDate", { startDate });
            }
            const withdrawnCount = await qbDeleted.getCount();

            const qbLogins = loginLogRepository.createQueryBuilder("log");
            if (startDate) {
                qbLogins.andWhere("log.login_at >= :startDate", { startDate });
            }
            const loginCount = await qbLogins.getCount();

            return {
                newUsers: newUsersCount,
                loginCount,
                withdrawnUsers: withdrawnCount,
            };
        };

        const totalActiveUsers = await userRepository.count();

        const [dayStats, weekStats, monthStats, allStats] = await Promise.all([
            getStatsForDate(oneDayAgo),
            getStatsForDate(oneWeekAgo),
            getStatsForDate(oneMonthAgo),
            getStatsForDate(null),
        ]);

        type StatsType = { newUsers: number; loginCount: number; withdrawnUsers: number; };
        const formatStats = (stats: StatsType) => ({
            totalUsers: totalActiveUsers, // We show the same total active users for all ranges, or total users at the end of period
            ...stats,
        });

        return NextResponse.json({
            "1 day": formatStats(dayStats),
            "1 week": formatStats(weekStats),
            "1 month": formatStats(monthStats),
            "All time": formatStats(allStats),
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
