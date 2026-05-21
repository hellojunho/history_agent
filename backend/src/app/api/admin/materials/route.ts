import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Material, MaterialCategory } from "@/entities/Material";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? verifyToken(token) : null;

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin only" }, { status: 403 });
        }

        const body = await request.json();
        const { category, title, contentUrl, filePath }: { 
            category: MaterialCategory; 
            title: string; 
            contentUrl?: string; 
            filePath?: string 
        } = body;

        const dataSource = await initializeDatabase();
        const materialRepository = dataSource.getRepository(Material);

        const newMaterial = materialRepository.create({
            category,
            title,
            contentUrl: contentUrl || null,
            filePath: filePath || null,
        });

        await materialRepository.save(newMaterial);

        return NextResponse.json(newMaterial, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
