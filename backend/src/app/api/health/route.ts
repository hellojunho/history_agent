import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";

export async function GET(): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        if (dataSource.isInitialized) {
            return NextResponse.json({ status: "ok", message: "Database connected" });
        }
        return NextResponse.json({ status: "error", message: "Database not initialized" }, { status: 500 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
    }
}
