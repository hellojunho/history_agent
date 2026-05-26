import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { CartoonEpisode } from "@/entities/CartoonEpisode";
import { CartoonCut } from "@/entities/CartoonCut";

// 시드 데이터 정의
const SEED_EPISODES = [
    {
        period: "삼국시대",
        periodOrder: 1,
        title: "만화로 보는 삼국 통일 과정",
        description: "나당동맹 결성부터 백제·고구려 멸망, 그리고 매소성과 기벌포 전투를 거쳐 신라가 삼국을 통일하기까지의 험난한 여정!",
        thumbnail: "/cartoon/01_three_kingdoms/cut_1.png",
        order: 1,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/01_three_kingdoms/cut_1.png",
                narration: "백제와 고구려의 압박에 시달리던 신라는 김춘추를 당나라로 보내 나당 동맹을 극적으로 체결합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "김춘추", text: "당 황제이시여, 백제와 고구려를 쳐서 반씩 나눕시다!" },
                        { name: "당나라 황제", text: "좋소! 동맹 성사! 크하하, 고구려 꼼짝 마라!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/01_three_kingdoms/cut_1.png",
                narration: "백제를 치기 위해 나당 연합군이 움직이고, 황산벌에서 계백의 5천 결사대와 김유신의 신라군이 대격돌합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "계백", text: "덤벼라! 목숨을 걸고 백제를 지키겠다!" },
                        { name: "김유신", text: "화랑들의 투지를 보아라! 당장 돌격하자!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/01_three_kingdoms/cut_1.png",
                narration: "결국 계백이 전사하고 사비성이 무너지며 천 년 사직의 백제가 멸망하게 됩니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "의자왕", text: "아아, 화려했던 백제여... 내 백성들을 두고 어이 갈꼬..." },
                        { name: "백제 백성", text: "흑흑, 사비성이 불타고 있사옵니다!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/01_three_kingdoms/cut_1.png",
                narration: "백제에 이어 고구려마저 멸망하자, 당나라는 한반도 전체를 지배하려는 야욕을 드러냅니다. 이에 신라는 당나라 군대와 매소성 및 기벌포에서 맞붙습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "당나라 장수", text: "이제 이 땅은 전부 우리 당나라 영토다!" },
                        { name: "신라 장수", text: "감히 우리 땅을 통째로 삼키려 해? 매소성 맛을 보아라! 당장 꺼져라!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/01_three_kingdoms/cut_1.png",
                narration: "매소성과 기벌포 전투에서 당나라 군을 시원하게 소탕한 신라는 마침내 대동강 이남의 영토를 확보하며 삼국 통일을 이룩합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "신라 장수", text: "와아아! 마침내 당나라 놈들을 몰아냈다! 후련하구나!" },
                        { name: "김유신", text: "반쪽짜리 통일이지만, 드디어 삼한에 평화가 찾아왔도다!" }
                    ]
                })
            }
        ]
    },
    {
        period: "고려시대",
        periodOrder: 2,
        title: "만화로 보는 고려의 건국 과정",
        description: "포악해진 궁예를 몰아낸 호족들과 왕건의 즉위, 신라의 평화 항복, 공산 전투의 위기극복을 거쳐 후삼국을 하나로 합치기까지!",
        thumbnail: "/cartoon/02_goryeo/cut_2.png",
        order: 1,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/02_goryeo/cut_1.png",
                narration: "후고구려의 궁예가 관심법을 남용하며 호족들을 포악하게 처형하자, 신하들은 결심을 굳힙니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "궁예", text: "으아아아!!! 감히 누가 기침 소리를 내었느냐?! 마군이가 끼었구나!" },
                        { name: "호족들", text: "으아악! 살려주십시오! 더는 이 미치광이 밑에 있을 수 없다! 왕건을 추대하자!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/02_goryeo/cut_2.png",
                narration: "호족들의 열렬한 추대를 받은 왕건이 마침내 왕위에 올라 나라 이름을 고려, 연호를 천수로 짓고 수도를 송악으로 이전합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "왕건", text: "새 나라 고려의 탄생이다! 연호는 천수(天授), 하늘이 내린 기회다!" },
                        { name: "고려 백성", text: "와아아! 왕건 만세! 드디어 살 만한 세상이 왔도다!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/02_goryeo/cut_3.png",
                narration: "고려의 세력이 나날이 번창하자, 쇠락한 신라의 마지막 경순왕은 나라와 백성의 평화를 위해 스스로 왕건에게 나라를 바치고 항복합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "경순왕", text: "왕건 왕이시여, 신라의 사직을 바칩니다. 부디 신라 백성들을 평화롭게 거두어주소서..." },
                        { name: "왕건", text: "어서 오십시오, 경순왕! 그 용단에 경의를 표하며 그대를 고려의 정승으로 임명하겠소!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/02_goryeo/cut_4.png",
                narration: "한편, 후백제의 견훤이 신라를 습격하자 왕건은 신라를 도우러 군사를 이끌고 갑니다. 하지만 공산 전투에서 후백제군에게 겹겹이 포위당하는 절대절명의 위기에 빠집니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "왕건", text: "아아, 적들에게 꽁꽁 둘러싸였구나! 고려는 여기서 끝이란 말인가..." },
                        { name: "신숭겸", text: "폐하! 제 옷을 입고 도망치소서! 여긴 제가 목숨을 걸고 막겠습니다! 으아아!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/02_goryeo/cut_5.png",
                narration: "충신 신숭겸의 값진 희생으로 탈출한 왕건은 전열을 재정비하여 고창 전투에서 마침내 후백제군을 대파하고 승기를 쟁취합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "왕건", text: "고창 전투 대승리다! 고려의 용사들이여, 기세를 몰아 적들을 소탕하라!" },
                        { name: "고려 장수", text: "우와아아! 전세 역전이다! 돌격하라!" }
                    ]
                })
            },
            {
                cutOrder: 6,
                imageUrl: "/cartoon/02_goryeo/cut_6.png",
                narration: "마침내 일리천 전투에서 견훤(고려에 투항함)과 함께 신검의 후백제군을 격파하며 왕건은 후삼국을 최종적으로 통합합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "왕건", text: "삼한 통합 완료! 하나 된 우리 강토에서 이제 새 역사를 써 내려가자!" },
                        { name: "견훤", text: "자식 놈들의 배신을 넘어 왕건과 함께 평화를 이루니 눈물이 나는구나, 와아!" }
                    ]
                })
            }
        ]
    },
    {
        period: "조선시대",
        periodOrder: 3,
        title: "만화로 보는 조선의 건국 과정",
        description: "위화도 회군을 감행한 이성계와 토지 개혁, 정몽주의 선죽교 피살과 조선의 건국, 그리고 한양으로의 천도까지!",
        thumbnail: "/cartoon/03_joseon/cut_1.png",
        order: 1,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/03_joseon/cut_1.png",
                narration: "요동 정벌을 위해 북진하던 이성계는 압록강 위화도에서 군사를 돌려 개경으로 진격하는 위화도 회군을 감행합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "이성계", text: "위화도 회군! 비바람이 몰아치고 4불가론이 있으니, 더 이상의 진격은 파멸뿐이다! 회군하라!" },
                        { name: "부하 군사들", text: "회군이다! 으아아, 살았다! 다시 개경으로 간다!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/03_joseon/cut_1.png",
                narration: "개경을 장악하고 실권을 쥔 이성계와 신진사대부들은 권문세족의 토지 지배를 혁파하기 위해 대대적인 과전법을 실시합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "이성계", text: "부정한 권문세족 놈들의 토지 문서를 광장에 모아 모조리 태워버려라!" },
                        { name: "백성들", text: "와아아! 우리에게도 진짜 농사지을 땅이 생기는구나! 만세!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/03_joseon/cut_1.png",
                narration: "조선 건국을 반대하고 고려 사직을 지키려 한 충신 정몽주를, 이성계의 아들 이방원이 선죽교에서 격살합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "정몽주", text: "이 몸이 백 번 꺾여도 고려를 향한 나의 단심가는 꺾이지 않으리!" },
                        { name: "이방원 부하", text: "말이 너무 많소! 철퇴나 받으시오! 퍼억!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/03_joseon/cut_1.png",
                narration: "모든 방해 세력을 제거한 이성계가 마침내 왕위에 올라, 찬란한 새 시대 '조선'의 개국을 공식 선포합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "이성계 (태조)", text: "오늘부터 새로운 역사의 아침이 밝았도다. 나라 이름은 조선(朝鮮)이다!" },
                        { name: "신하들", text: "경하드리옵니다, 전하! 조선의 앞날에 영광이 있으리라!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/03_joseon/cut_1.png",
                narration: "왕조가 안정된 후, 풍수와 지리가 뛰어난 한양으로 도읍을 옮기고 웅장하고 아름다운 경복궁을 새로이 짓습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "정도전", text: "한양은 산과 물이 둘러싸고 교통도 사통팔달이니, 천 년 왕조의 명당이옵니다!" },
                        { name: "이성계", text: "한양으로 천도하자! 조선 백성들의 새로운 활기찬 무대가 될 것이다!" }
                    ]
                })
            }
        ]
    },
    {
        period: "근현대",
        periodOrder: 4,
        title: "만화로 보는 3·1 운동",
        description: "고종 황제의 독살설과 탑골공원에서 시작된 독립 만세 소리, 유관순 열사의 주도와 대한민국 임시정부 수립의 감격!",
        thumbnail: "/cartoon/04_modern/cut_1.png",
        order: 1,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/04_modern/cut_1.png",
                narration: "고종 황제의 의문사로 민족의 서러움과 분노가 극에 달한 가운데, 민족대표 33인이 독립선언서를 작성하고 탑골공원에서 독립 만세 소리가 울려 퍼집니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "청년 학생", text: "오늘 우리는 인도주의의 인도 하에 정당한 권리로 대한독립만세를 외칩니다!" },
                        { name: "시민들", text: "대한독립만세!! 와아아!! 우리나라는 자주국이다!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/04_modern/cut_1.png",
                narration: "어린 고등학생이었던 유관순 열사는 고향 천안 아우내 장터로 내려가 수많은 군중들에게 태극기를 나눠주며 역사적인 만세 운동을 직접 주도합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "유관순", text: "대한독립만세! (Long Live Korean Independence!) 나라를 위해 목숨 바쳐 싸웁시다!" },
                        { name: "장터 백성들", text: "만세! 만세! 우리 태극기를 흔들며 일제 놈들에게 우리의 의지를 보여주자!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/04_modern/cut_1.png",
                narration: "일제가 총칼로 제암리 교회 학살 등 피비린내 나는 진압을 벌였음에도, 만세의 함성은 꺼지지 않고 전 세계에 울려 퍼집니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "독립운동가", text: "우리의 몸은 차가운 지하 감옥에 가둘지언정, 독립을 향한 타오르는 열망은 꺾지 못하리!" },
                        { name: "일본 헌병", text: "으아악, 저 끈질긴 조선인들을 다 가둬도 만세 소리가 끊이질 않는구나!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/04_modern/cut_1.png",
                narration: "3·1 만세 운동으로 폭발한 민족의 자주독립 의지를 한데 모아, 마침내 상하이에 우리 역사상 최초의 공화정인 대한민국 임시정부가 자랑스럽게 수립됩니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "임시정부 요인", text: "이제 우리는 왕의 신민이 아닌 백성이 당당한 주권자가 되는 공화정, 대한민국을 선포하오!" },
                        { name: "독립투사들", text: "와아아! 마침내 진정한 우리의 민주 정부가 탄생했도다! 끝까지 투쟁하자!" }
                    ]
                })
            }
        ]
    }
];

export async function GET(): Promise<NextResponse> {
    try {
        const dataSource = await initializeDatabase();
        const episodeRepository = dataSource.getRepository(CartoonEpisode);
        const cutRepository = dataSource.getRepository(CartoonCut);

        // 1. 만화 에피소드 개수 체크
        const count = await episodeRepository.count();

        // 2. 만약 데이터가 전혀 없으면 자동 시딩 진행
        if (count === 0) {
            console.log("No cartoon episodes found. Seeding initial data...");

            for (const epData of SEED_EPISODES) {
                // 에피소드 저장
                const episode = new CartoonEpisode();
                episode.period = epData.period;
                episode.periodOrder = epData.periodOrder;
                episode.title = epData.title;
                episode.description = epData.description;
                episode.thumbnail = epData.thumbnail;
                episode.order = epData.order;

                const savedEpisode = await episodeRepository.save(episode);

                // 소속 컷들 저장
                for (const cutData of epData.cuts) {
                    const cut = new CartoonCut();
                    cut.episodeId = savedEpisode.id;
                    cut.cutOrder = cutData.cutOrder;
                    cut.imageUrl = cutData.imageUrl;
                    cut.narration = cutData.narration;
                    cut.dialogue = cutData.dialogue;

                    await cutRepository.save(cut);
                }
            }
            console.log("Cartoon Seeding completed successfully!");
        }

        // 3. 에피소드 목록 조회 (시대 순, 사건 순)
        const episodes = await episodeRepository.find({
            order: {
                periodOrder: "ASC",
                order: "ASC"
            }
        });

        return NextResponse.json({ data: episodes }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
