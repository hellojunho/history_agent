import fs from "fs";
import path from "path";
import MarkdownViewer from "../MarkdownViewer";
import { ERA_LIST } from "../eraList";

export async function generateStaticParams() {
    return ERA_LIST.map((era) => ({
        era: era.id,
    }));
}

export default async function EraPage({ params }: { params: { era: string } }) {
    const eraId = params.era;
    const eraTitle = ERA_LIST.find((e) => e.id === eraId)?.title || "시대 정보 없음";
    
    // Read all files in the era directory
    const dirPath = path.join(process.cwd(), "src/data/history_deep", eraId);
    let combinedContent = `# ${eraTitle}\n\n`;

    try {
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
            
            // Sort files so that 정치 comes first, then 경제, 사회, 문화...
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
                const filePath = path.join(dirPath, file);
                const fileContent = fs.readFileSync(filePath, "utf-8");
                combinedContent += `\n\n---\n\n${fileContent}`;
            }
        } else {
            combinedContent += "데이터를 수집 중이거나 해당 시대의 자료가 없습니다.";
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        combinedContent += "자료를 불러오는 중 오류가 발생했습니다.";
    }

    return (
        <div>
            <MarkdownViewer content={combinedContent} />
        </div>
    );
}
