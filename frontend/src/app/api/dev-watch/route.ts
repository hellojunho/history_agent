import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Active SSE clients
let clients: ReadableStreamDefaultController[] = [];

// Start watching the markdown directory in development mode
if (process.env.NODE_ENV === "development") {
    const watchPath = path.join(process.cwd(), "src/data/history_deep");
    
    if (fs.existsSync(watchPath)) {
        let watchTimeout: NodeJS.Timeout | null = null;
        
        fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith(".md")) {
                if (watchTimeout) clearTimeout(watchTimeout);
                
                // Debounce notifications to avoid duplicate triggers
                watchTimeout = setTimeout(() => {
                    console.log(`[DevWatch] Markdown file changed: ${filename}. Notifying clients...`);
                    clients.forEach((client) => {
                        try {
                            client.enqueue(new TextEncoder().encode("data: reload\n\n"));
                        } catch (e) {
                            // Ignore closed streams
                        }
                    });
                }, 100);
            }
        });
    }
}

export async function GET(request: Request) {
    if (process.env.NODE_ENV !== "development") {
        return new Response("Not Allowed", { status: 403 });
    }

    const stream = new ReadableStream({
        start(controller) {
            clients.push(controller);
            
            request.signal.addEventListener("abort", () => {
                clients = clients.filter((c) => c !== controller);
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
