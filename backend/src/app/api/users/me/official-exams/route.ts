import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { User } from "@/entities/User";
import { verifyToken } from "@/lib/auth";
import { spawn } from "child_process";
import path from "path";

interface ScraperOutput {
    success: boolean;
    error?: string;
    applications?: Array<{
        round: number;
        title: string;
        examType: string;
        registrationNo: string;
        examDate: string;
        testCenter: string;
        paymentStatus: string;
        fee: number;
        examineeNo: string;
        status: string;
    }>;
    results?: Array<{
        round: number;
        title: string;
        examType: string;
        examineeNo: string;
        examDate: string;
        score: number;
        passGrade: string;
        status: string;
        issueNo: string;
        issueStatus: string;
    }>;
}

// 백그라운드 비동기 크롤링 동기화 함수
async function triggerBackgroundSync(userId: string, hanneunggeomId: string, hanneunggeomPassword: string) {
    try {
        const pythonPath = process.env.NODE_ENV === "production" ? "/app/venv/bin/python3" : "python3";
        const scriptPath = path.join(process.cwd(), "src/lib/scrape_official.py");

        const scrapedData = await new Promise<ScraperOutput>((resolve, reject) => {
            const pyProcess = spawn(pythonPath, [scriptPath], {
                env: {
                    ...process.env,
                    PLAYWRIGHT_BROWSERS_PATH: "/app/.cache/ms-playwright"
                }
            });

            let stdoutData = "";
            let stderrData = "";

            pyProcess.stdout.on("data", (data: Buffer) => {
                stdoutData += data.toString();
            });

            pyProcess.stderr.on("data", (data: Buffer) => {
                stderrData += data.toString();
            });

            pyProcess.on("close", (code: number | null) => {
                if (code !== 0) {
                    reject(new Error(`Scraper failed with code ${code}. Stderr: ${stderrData}`));
                    return;
                }
                try {
                    const parsed = JSON.parse(stdoutData.trim());
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Failed to parse scraper output. Raw: ${stdoutData}`));
                }
            });

            pyProcess.stdin.write(`${hanneunggeomId}\n${hanneunggeomPassword}\n`);
            pyProcess.stdin.end();
        });

        if (scrapedData && scrapedData.success) {
            const dataSource = await initializeDatabase();
            const userRepository = dataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });
            
            if (user && !user.deletedAt) {
                user.hanneunggeomApplicationsCache = scrapedData.applications || [];
                user.hanneunggeomResultsCache = scrapedData.results || [];
                user.hanneunggeomCacheUpdatedAt = new Date();
                await userRepository.save(user);
                console.log(`✅ [Hanneunggeom Sync] Successfully synced real-time data for user: ${user.email}`);
            }
        } else {
            console.warn(`⚠️ [Hanneunggeom Sync Warning] Scraper failed for user: ${userId}, error: ${scrapedData?.error}`);
        }
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown sync error";
        console.error(`❌ [Hanneunggeom Sync Crash] Exception occurred during background sync for user: ${userId}`, errMsg);
    }
}

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

        if (!user.hanneunggeomId) {
            return NextResponse.json({
                hasId: false,
                applications: [],
                results: []
            }, { status: 200 });
        }

        if (!user.hanneunggeomPassword) {
            return NextResponse.json({
                hasId: true,
                hanneunggeomId: user.hanneunggeomId,
                applications: [],
                results: [],
                message: "실시간 연동용 비밀번호가 등록되어 있지 않습니다. 마이페이지에서 연동을 해 주세요."
            }, { status: 200 });
        }

        // 1. 캐시 데이터가 존재하면 즉시 0.001초 만에 반환 (더미 데이터 폴백 배제)
        if (user.hanneunggeomApplicationsCache !== null && user.hanneunggeomResultsCache !== null) {
            
            // 마지막 갱신 시각이 30분 이상 지났다면 백그라운드 비동기 동기화 트리거
            const cacheAgeMs = user.hanneunggeomCacheUpdatedAt 
                ? Date.now() - new Date(user.hanneunggeomCacheUpdatedAt).getTime() 
                : Infinity;
            
            if (cacheAgeMs > 30 * 60 * 1000) {
                console.log(`⏰ [Hanneunggeom Cache Age: ${Math.round(cacheAgeMs/60000)}m] Triggering asynchronous background sync...`);
                // await 하지 않고 백그라운드 Promise 처리
                triggerBackgroundSync(user.id, user.hanneunggeomId, user.hanneunggeomPassword);
            }

            return NextResponse.json({
                hasId: true,
                isReal: true,
                hanneunggeomId: user.hanneunggeomId,
                applications: user.hanneunggeomApplicationsCache,
                results: user.hanneunggeomResultsCache
            }, { status: 200 });
        }

        // 2. 최초 연동 상태 (캐시 없음) -> 유일하게 1회에 한해 실시간 대기 크롤링 기동
        try {
            const pythonPath = process.env.NODE_ENV === "production" ? "/app/venv/bin/python3" : "python3";
            const scriptPath = path.join(process.cwd(), "src/lib/scrape_official.py");
            
            const scrapedData = await new Promise<ScraperOutput>((resolve, reject) => {
                const pyProcess = spawn(pythonPath, [scriptPath], {
                    env: {
                        ...process.env,
                        PLAYWRIGHT_BROWSERS_PATH: "/app/.cache/ms-playwright"
                    }
                });
                
                let stdoutData = "";
                let stderrData = "";
                
                pyProcess.stdout.on("data", (data: Buffer) => {
                    stdoutData += data.toString();
                });
                
                pyProcess.stderr.on("data", (data: Buffer) => {
                    stderrData += data.toString();
                });
                
                pyProcess.on("close", (code: number | null) => {
                    if (code !== 0) {
                        reject(new Error(`Scraper failed with code ${code}. Stderr: ${stderrData}`));
                        return;
                    }
                    try {
                        const parsed = JSON.parse(stdoutData.trim());
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error(`Failed to parse scraper output. Raw: ${stdoutData}`));
                    }
                });
                
                pyProcess.stdin.write(`${user.hanneunggeomId}\n${user.hanneunggeomPassword}\n`);
                pyProcess.stdin.end();
            });
            
            if (scrapedData && scrapedData.success) {
                // 성공 시 캐시 정보 동시 저장
                user.hanneunggeomApplicationsCache = scrapedData.applications || [];
                user.hanneunggeomResultsCache = scrapedData.results || [];
                user.hanneunggeomCacheUpdatedAt = new Date();
                await userRepository.save(user);

                return NextResponse.json({
                    hasId: true,
                    isReal: true,
                    hanneunggeomId: user.hanneunggeomId,
                    applications: scrapedData.applications || [],
                    results: scrapedData.results || []
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    message: scrapedData?.error || "공식 사이트 로그인 및 데이터 파싱에 실패했습니다."
                }, { status: 400 });
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "공식 사이트 연동 중 에러가 발생했습니다.";
            return NextResponse.json({
                message: errMsg
            }, { status: 500 });
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
