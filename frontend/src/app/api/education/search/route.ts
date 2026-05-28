import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ERA_LIST } from "@/app/education/eraList";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
        return NextResponse.json({ error: "검색어를 입력해 주세요." }, { status: 400 });
    }

    try {
        const historyDeepDir = path.join(process.cwd(), "src/data/history_deep");
        
        // ERA_LIST 순서대로 각 폴더를 순회하여 검색어가 들어있는 최초의 시대 및 매칭 라인을 탐색
        for (const era of ERA_LIST) {
            const eraDir = path.join(historyDeepDir, era.id);
            if (!fs.existsSync(eraDir)) continue;

            const files = fs.readdirSync(eraDir).filter(file => file.endsWith(".md"));
            
            // 학습 흐름에 맞춘 우선순위 정렬
            files.sort((a, b) => {
                const order = ["정치.md", "경제.md", "사회.md", "문화.md", "대외관계.md"];
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            for (const file of files) {
                const filePath = path.join(eraDir, file);
                const fileContent = fs.readFileSync(filePath, "utf-8");

                // 대소문자 구분 없이 검색어 포함 여부 확인
                if (fileContent.toLowerCase().includes(query.toLowerCase())) {
                    return NextResponse.json({
                        success: true,
                        eraId: era.id,
                        eraTitle: era.title,
                        fileName: file.replace(".md", "")
                    });
                }
            }
        }

        // 매칭되는 결과가 없음
        return NextResponse.json({
            success: false,
            message: "검색 결과에 부합하는 역사 기록이 존재하지 않습니다."
        });

    } catch (error) {
        console.error("Historical search failed:", error);
        return NextResponse.json({ error: "검색 중 알 수 없는 서버 오류가 발생했습니다." }, { status: 500 });
    }
}
