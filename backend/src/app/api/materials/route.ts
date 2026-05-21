import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { Material, MaterialCategory } from "@/entities/Material";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") as MaterialCategory | null;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const dataSource = await initializeDatabase();
        const materialRepository = dataSource.getRepository(Material);

        const queryBuilder = materialRepository.createQueryBuilder("material");

        if (category) {
            queryBuilder.where("material.category = :category", { category });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy("material.createdAt", "DESC")
            .getManyAndCount();

        return NextResponse.json({
            data,
            meta: {
                total,
                page,
                limit,
            },
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
