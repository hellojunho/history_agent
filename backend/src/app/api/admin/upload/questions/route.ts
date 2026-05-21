import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

// 백그라운드 파싱 트리거 함수
function triggerParsing(round: string) {
    console.log(`[Parser Trigger] Starting background parsing for round ${round}...`);
    // make parse 백그라운드 실행
    exec("make parse", { cwd: "/app" }, (err, stdout) => {
        if (err) {
            console.error(`[Parser Trigger] make parse failed for round ${round}:`, err);
            return;
        }
        console.log(`[Parser Trigger] make parse succeeded for round ${round}:\n`, stdout);
        
        // 1단계 성공 후 2단계(make parse-playwright) 실행
        console.log(`[Parser Trigger] Starting playwright parsing for round ${round}...`);
        exec("make parse-playwright", { cwd: "/app" }, (err2, stdout2) => {
            if (err2) {
                console.error(`[Parser Trigger] make parse-playwright failed for round ${round}:`, err2);
                return;
            }
            console.log(`[Parser Trigger] make parse-playwright succeeded for round ${round}:\n`, stdout2);
        });
    });
}

// 조건 체크 및 트리거
function checkAndTrigger(round: string) {
    const questionDir = path.join("/app", "download", round, "question");
    const answerDir = path.join("/app", "download", round, "answer");
    
    const hasQuestion = fs.existsSync(questionDir) && fs.readdirSync(questionDir).some(file => file.endsWith(".pdf"));
    const hasAnswer = fs.existsSync(answerDir) && fs.readdirSync(answerDir).some(file => file.endsWith(".pdf"));
    
    if (hasQuestion && hasAnswer) {
        triggerParsing(round);
        return true;
    }
    return false;
}

export async function POST(request: Request) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const fileName = file.name;
        // extract round number (e.g., '77회 ...' or '77회_...' -> 77)
        const roundMatch = fileName.match(/(\d+)회/);
        if (!roundMatch) {
            return NextResponse.json({ message: "Cannot find exam round from file name (e.g. '77회')" }, { status: 400 });
        }
        
        const round = roundMatch[1];
        
        // Target directory: /app/download/{round}/question
        const uploadDir = path.join("/app", "download", round, "question");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        fs.writeFileSync(filePath, buffer);
        console.log(`[PDF Upload] Saved question file to: ${filePath}`);

        const triggered = checkAndTrigger(round);

        return NextResponse.json({
            message: "File uploaded successfully",
            fileName,
            round,
            type: "question",
            parserTriggered: triggered
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
