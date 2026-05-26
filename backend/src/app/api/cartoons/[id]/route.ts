import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { CartoonEpisode } from "@/entities/CartoonEpisode";
import { CartoonCut } from "@/entities/CartoonCut";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const episodeId = parseInt(params.id);
        if (isNaN(episodeId)) {
            return NextResponse.json({ message: "Invalid Episode ID" }, { status: 400 });
        }

        const dataSource = await initializeDatabase();
        const episodeRepository = dataSource.getRepository(CartoonEpisode);
        const cutRepository = dataSource.getRepository(CartoonCut);

        // 에피소드 단건 조회
        const episode = await episodeRepository.findOne({
            where: { id: episodeId }
        });

        if (!episode) {
            return NextResponse.json({ message: "Cartoon episode not found" }, { status: 404 });
        }

        // 해당 에피소드의 모든 컷들 조회 (순서대로)
        const cuts = await cutRepository.find({
            where: { episodeId },
            order: { cutOrder: "ASC" }
        });

        // dialogue 파싱 처리 (JSON string -> object)
        const formattedCuts = cuts.map((cut) => {
            let parsedDialogue = null;
            if (cut.dialogue) {
                try {
                    parsedDialogue = JSON.parse(cut.dialogue);
                } catch {
                    parsedDialogue = { characters: [{ name: "", text: cut.dialogue }] };
                }
            }
            return {
                ...cut,
                dialogue: parsedDialogue
            };
        });

        return NextResponse.json({
            data: {
                ...episode,
                cuts: formattedCuts
            }
        }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
