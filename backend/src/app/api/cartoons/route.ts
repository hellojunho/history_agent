import { NextResponse } from "next/server";
import { initializeDatabase } from "@/data-source";
import { CartoonEpisode } from "@/entities/CartoonEpisode";
import { CartoonCut } from "@/entities/CartoonCut";

// 시드 데이터 정의
const SEED_EPISODES = [
    {
        period: "선사·고조선",
        periodOrder: 0,
        title: "만화로 보는 신석기 혁명",
        description: "뗀석기와 이동 채집 생활을 끝내고, 간석기와 빗살무늬 토기를 사용하며 최초로 농경 정착을 시작한 인류 역사상 위대한 대전환!",
        thumbnail: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_1.png",
        order: 1,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_1.png",
                narration: "인류는 뗀석기 사용을 멈추고, 돌을 정교하게 갈아 만든 간석기를 사용하기 시작했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "석기인 A", text: "돌을 갈아서 도구를 만드니 훨씬 날카롭네!" },
                        { name: "석기인 B", text: "사냥이 훨씬 쉬워질 거야!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_2.png",
                narration: "남은 식량을 오랫동안 보관하고 물을 끓이기 위해 빗살무늬 토기를 최초로 발명했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "토기장인", text: "토기 표면에 빗살무늬를 넣어 튼튼하게 구웠소!" },
                        { name: "부족민", text: "여기에 곡식을 저장하자!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_3.png",
                narration: "식량을 얻기 유용한 강가나 바닷가 근처에 둥근 움집을 짓고 드디어 정착 생활의 첫발을 내디뎠습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "움집 청년", text: "바람을 막아주는 아늑한 우리 집이 생겼어!" },
                        { name: "움집 소녀", text: "강가에서 정착하니 좋아!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_4.png",
                narration: "야생 동물을 사육하기 시작하면서, 인류 최초의 목축(돼지, 개 등) 활동이 시작되었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "부족민 C", text: "동물을 가두어 기르니 사냥을 안 가도 든든해!" },
                        { name: "부족민 D", text: "가축들이 꽤 순해졌군!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_5.png",
                narration: "밭을 성실하게 일구며 조, 수수, 기장 등의 작물을 재배하는 밭농사가 인류 최초로 시작되었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "농경민 A", text: "밭농사의 위대한 시작이로다! 싹이 튼다!" },
                        { name: "농경민 B", text: "풍요로운 수확을 기대해!" }
                    ]
                })
            },
            {
                cutOrder: 6,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_6.png",
                narration: "뼈바늘과 가락바퀴를 발명하면서 실을 뽑고 옷과 그물을 직접 제작하여 사용하는 원시 수공업이 발달했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "장인 A", text: "가락바퀴를 돌려 실을 뽑아내고 있소!" },
                        { name: "장인 B", text: "뼈바늘로 옷을 튼튼히 깁자!" }
                    ]
                })
            },
            {
                cutOrder: 7,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_7.png",
                narration: "지혜로운 부족장을 중심으로 씨족과 부족원들이 뭉치며, 평등하고 끈끈한 혈연 공동체 사회를 이루었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "부족장", text: "우리 씨족의 평화와 단결을 위하여 다 함께 힘을 모읍시다!" },
                        { name: "부족원들", text: "추장님 말씀이 맞습니다!" }
                    ]
                })
            },
            {
                cutOrder: 8,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_8.png",
                narration: "태양과 산천 등 자연물에 정령이 깃들어 있다고 믿는 애니미즘과 원시 신앙의 첫 싹이 트기 시작했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "무당", text: "태양과 거대한 고목 나무에 깃든 위대하신 영혼들이시여!" },
                        { name: "기도인", text: "부디 풍요를 내려주소서!" }
                    ]
                })
            },
            {
                cutOrder: 9,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_9.png",
                narration: "가을철 풍성한 수확을 마친 씨족원들이 모닥불 주위에서 춤을 추고 음식을 기쁘게 나누어 가졌습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "주민 A", text: "음식이 산더미처럼 많으니 수확의 기쁨이 넘치는군!" },
                        { name: "주민 B", text: "음악에 맞춰 다 함께 춤을!" }
                    ]
                })
            },
            {
                cutOrder: 10,
                imageUrl: "/cartoon/00_prehistory/prehistory_1_shinsukgi/cut_10.png",
                narration: "스스로 식량을 생산하고 마침내 한곳에 정착해 정주하게 된 이 대전환은 훗날 인류 문명의 기초가 된 '신석기 혁명'으로 빛나게 기록됩니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "역사 학자", text: "생산 경제로의 위대한 이행, 그것은 신석기 혁명입니다!" },
                        { name: "부족민들", text: "우리의 평화와 도약을 위하여!" }
                    ]
                })
            }
        ]
    },
    {
        period: "선사·고조선",
        periodOrder: 0,
        title: "만화로 보는 고조선 건국",
        description: "환웅의 지상 강림과 마늘·쑥을 견뎌낸 웅녀의 혼인, 그리고 마침내 아사달에 세워진 우리나라 역사상 최초의 국가 고조선의 건국!",
        thumbnail: "/cartoon/00_prehistory/prehistory_2_dangun/cut_5.png",
        order: 2,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_1.png",
                narration: "하늘나라를 지배하던 상제 환인의 아들 환웅은 아래에 있는 인간 세상을 깊이 사모하고 다스리기를 구했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "환인", text: "지상 세상을 보니 참으로 널리 인간을 이롭게 할 만하도다!" },
                        { name: "환웅", text: "아버님, 제가 내려가 평화로운 세상을 일구겠나이다!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_2.png",
                narration: "바람, 비, 구름을 거느리는 신하들과 3,000명의 무리를 대동하여 태백산 신단수 아래로 장엄하게 내려왔습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "환웅", text: "지상으로 가자! 널리 인간을 이롭게 하리라!" },
                        { name: "비장군", text: "바람과 비를 정밀히 조율해 농사를 풍성하게 돕겠습니다!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_3.png",
                narration: "환웅은 신시를 열고 곡식, 수명, 형벌, 선악 등 인간 세상의 360여 가지 핵심 국사를 주관하며 세상을 다스렸습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "신하 A", text: "백성들이 신시의 평화와 질서에 크게 기뻐하고 있사옵니다!" },
                        { name: "환웅", text: "법과 도리를 굳건히 세워 행복을 널리 퍼뜨려라!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_4.png",
                narration: "인간이 되고 싶어 찾아온 곰과 호랑이에게 환웅은 마늘과 쑥을 건네며, 100일 동안 햇빛을 보지 말고 동굴에서 참으라 일렀습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "환웅", text: "이 쑥과 마늘을 먹으며 100일간 동굴 속에서 꿋꿋이 견뎌내어라!" },
                        { name: "곰", text: "꼭 견뎌내어 진짜 인간이 될 테야!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_5.png",
                narration: "동굴의 혹독한 매운맛과 지독한 어둠을 견디지 못하고, 참을성 없던 호랑이는 결국 중도에 동굴 밖으로 뛰쳐나갔습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "호랑이", text: "으아악! 마늘은 너무 맵다! 난 뛰쳐나갈래!" },
                        { name: "곰", text: "조금만 더 참자... 참는 자에게 복이 있나니!" }
                    ]
                })
            },
            {
                cutOrder: 6,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_6.png",
                narration: "곰은 끝까지 꿋꿋이 인내하여 마침내 삼칠일(21일) 만에 아름다운 인간 여인인 '웅녀'로 환골탈태하였습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "웅녀", text: "아아, 내가 드디어 진짜 아름다운 인간이 되었구나! 기쁘도다!" },
                        { name: "하늘 천사", text: "인내의 결실을 축하합니다!" }
                    ]
                })
            },
            {
                cutOrder: 7,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_7.png",
                narration: "인간이 된 웅녀는 함께 할 짝이 없어 매일 신단수 아래에서 아이를 가지게 해달라고 신실하게 축원 기도를 올렸습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "웅녀", text: "신령스러우신 신단수여, 부디 저에게 지혜로운 아기를 가질 은총을 허락하소서!" },
                        { name: "웅녀 친구", text: "지성이면 감천이옵니다." }
                    ]
                })
            },
            {
                cutOrder: 8,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_8.png",
                narration: "웅녀의 깊은 인내심과 정성에 탄복한 환웅은 정식으로 지상에서 거룩하고 축복 어린 신성한 혼인을 맺었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "환웅", text: "그대의 아름다운 숭고함에 경의를 표하며 평생의 정식 배필로 맞아들이겠소!" },
                        { name: "웅녀", text: "참으로 감사합니다. 부디 이 땅에 큰 축복을 내리소서!" }
                    ]
                })
            },
            {
                cutOrder: 9,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_9.png",
                narration: "두 신령스러운 존재 사이에서 마침내 온 지상의 축복을 받으며 영특하고 비범한 우두머리 '단군왕검'이 탄생했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "웅녀", text: "오, 영롱한 우리 아기 단군왕검! 참으로 비범하군요!" },
                        { name: "환웅", text: "하늘과 땅의 맑은 기운을 모두 머금었도다. 훌륭한 군주가 될 상이다!" }
                    ]
                })
            },
            {
                cutOrder: 10,
                imageUrl: "/cartoon/00_prehistory/prehistory_2_dangun/cut_10.png",
                narration: "장성한 단군왕검은 아사달에 도읍을 세워 우리나라 최초의 찬란한 고대 국가인 '고조선'의 성스러운 개국을 선포했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "단군왕검", text: "홍익인간의 위대한 나라 고조선 건국을 선포하노라! 널리 평화와 조화가 있으라!" },
                        { name: "고조선 민중", text: "단군왕검 전하 만세! 고조선 만세! 길이길이 사직을 빛내 주소서!" }
                    ]
                })
            }
        ]
    },
    {
        period: "선사·고조선",
        periodOrder: 0,
        title: "만화로 보는 위만의 집권",
        description: "중국 혼란기 상투를 틀고 망명해 온 위만이 국경 수비를 맡으며 철기 세력을 키운 뒤, 준왕을 축출하고 왕위를 차지하기까지!",
        thumbnail: "/cartoon/00_prehistory/prehistory_3_wiman/cut_1.png",
        order: 3,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_1.png",
                narration: "중국의 대격변기였던 진·한 교체기 전란이 극에 치달아 황폐해진 땅에서 무수한 유민 피난 세력이 급증했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "중국 피난민 A", text: "전쟁이 끊이질 않으니 이대로는 굶어 죽겠다!" },
                        { name: "중국 피난민 B", text: "동쪽의 번영한 고조선 땅으로 길을 떠나세!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_2.png",
                narration: "똑똑하고 영리한 군사 지휘관 위만은 고조선 유민을 뜻하는 상투를 틀고 조선인의 전통 옷을 정갈하게 차려입었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "상투를 틀고 조선인의 옷을 단단히 차려입었으니, 동포들이 우리를 반길 것이오!" },
                        { name: "참모", text: "장군, 매우 당당하고 훌륭한 계책입니다!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_3.png",
                narration: "위만은 1,000여 명의 많은 망명인 무리를 영도하여 마침내 패수 강을 건너 고조선의 도성으로 힘차게 진입했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "상투를 틀고 정중히 고조선으로 망명해 왔습니다! 저희 무리를 평화롭게 받아주소서!" },
                        { name: "수비 장수", text: "기백이 보통 인물이 아니로군. 당장 준왕 전하께 고하겠다!" }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_4.png",
                narration: "위만의 비범함과 상투에 감명받은 고조선 준왕은 그의 무리를 정식 수용하며 깊은 충심을 기대하고 아꼈습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "준왕", text: "위만, 그대의 비범함과 조선의 옷매무새가 마음에 드는구려. 기꺼이 망명을 허가하오!" },
                        { name: "위만", text: "성은이 망극하옵니다, 준왕 전하! 뼈를 묻어 보답하겠습니다!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_5.png",
                narration: "준왕은 위만에게 수십 리의 서쪽 요충지 국경 땅을 다스리게 하고, 번방을 굳건히 수호하는 수비대 군사권을 수여했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "준왕", text: "서쪽 국경 수비를 통째로 그대에게 전권 임명하오. 번방을 튼튼히 사수하시오!" },
                        { name: "위만", text: "철통같은 수비를 보여드리겠습니다. 안심하옵소서!" }
                    ]
                })
            },
            {
                cutOrder: 6,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_6.png",
                narration: "그러나 위만은 국경을 지키며 몰래 최첨단 철제 칼과 창, 강력한 철기 방패를 대량으로 은밀히 축조했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "이 튼튼하고 예리한 철제 무기들을 신속히 규합하고 군사들을 맹 훈련시켜라!" },
                        { name: "대장장이", text: "고조선 최강의 철기 무기가 밤낮으로 쏟아지고 있사옵니다!" }
                    ]
                })
            },
            {
                cutOrder: 7,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_7.png",
                narration: "중국에서 끊임없이 망명해 오는 진보된 철기 기술 유민 세력을 적극 끌어안으며 사적 군대를 강력히 보강했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "철기 기술을 지닌 유민들을 환대하고 우리 군대의 핵심으로 배치하라!" },
                        { name: "기술자 대표", text: "이 훌륭한 철제 병장기를 장군께 정성스레 바칩니다!" }
                    ]
                })
            },
            {
                cutOrder: 8,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_8.png",
                narration: "세력이 비대해지자 위만은 마침내 한나라 대군이 기습 침공해 온다는 거짓 전령을 보내 준왕을 완벽히 속였습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "거짓 전령", text: "보고드립니다! 한나라 군대가 여러 갈래로 국경을 넘어 대대적으로 쳐들어오고 있습니다!" },
                        { name: "준왕", text: "아니, 벌써 당도했단 말인가?! 큰일이로구나!" }
                    ]
                })
            },
            {
                cutOrder: 9,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_9.png",
                narration: "준왕을 보위한다는 명분으로 철기 군대를 재빠르게 진격시켜, 비어있던 왕검성 조정으로 거침없이 무단 침입했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "대궐을 전격 포위하라! 준왕을 지키는 척하되 철저하게 무장해제시켜라!" },
                        { name: "위만 부대", text: "돌격하라! 한 놈도 궁을 빠져나가지 못하게 하라!" }
                    ]
                })
            },
            {
                cutOrder: 10,
                imageUrl: "/cartoon/00_prehistory/prehistory_3_wiman/cut_10.png",
                narration: "결국 눈이 속은 준왕을 비참하게 몰아내고 스스로 고조선 왕위를 찬탈하여, 철기 문화가 본격 꽃피는 '위만조선'의 아침을 열었습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "위만", text: "준왕은 몰러가라! 오늘부터 내가 고조선의 새 왕이다!" },
                        { name: "신하들", text: "위만 대왕 만세! 새로운 위만조선의 강력한 최전성기가 개막했도다!" }
                    ]
                })
            }
        ]
    },
    {
        period: "선사·고조선",
        periodOrder: 0,
        title: "만화로 보는 고조선의 멸망",
        description: "중계 무역의 독점적 번성에 분노한 한무제의 대규모 침공, 수도 왕검성을 사수한 1년간의 격전과 내부 분열에 따른 안타까운 멸망!",
        thumbnail: "/cartoon/00_prehistory/prehistory_4_fall/cut_3.png",
        order: 4,
        cuts: [
            {
                cutOrder: 1,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_1.png",
                narration: "위만조선은 정교하고 우수한 철제 농기구와 무기를 영토 곳곳에 보급하며 국력을 크게 확장시켰습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "백성 A", text: "철제 괭이와 쟁기로 농사를 지으니 곡식이 산더미요!" },
                        { name: "백성 B", text: "우리 고조선의 철제 무기가 천하제일이도다!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_2.png",
                narration: "강성해진 강력한 철기 군사력을 바탕으로 주변의 이웃 소국들인 진번과 임둔을 차례로 정복하여 영토를 넓혔습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "고조선 장수", text: "진번과 임둔 세력을 완벽히 제압하고 복속시켰사옵니다!" },
                        { name: "우거왕", text: "좋소! 사방으로 우리 고조선의 위세를 떨치시오!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_3.png",
                narration: "한나라와 한반도 남부 진(辰)국 사이의 통상로를 막고, 독점적인 중계 무역으로 막대한 국가 재정 이익을 누렸습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "고조선 상인", text: "한나라 비단과 남쪽 진국 철을 중계하여 엄청난 마진을 남겼소!" },
                        { name: "진국 상인", text: "우리가 직접 교류하고 싶으나 고조선이 결사코 길을 막는구려." }
                    ]
                })
            },
            {
                cutOrder: 4,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_4.png",
                narration: "막대한 무역 손실과 영토 팽창에 몹시 대노한 중국 한나라의 절대 군주 '한무제'는 고조선 격파를 결심했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "한무제", text: "감히 고조선 놈들이 감히 중계 무역을 가로막고 무역로를 통제해?! 절대 용납 못 한다!" },
                        { name: "한나라 재상", text: "황제 폐하, 즉시 강력한 군대를 일으켜 토벌하소서!" }
                    ]
                })
            },
            {
                cutOrder: 5,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_5.png",
                narration: "마침내 한무제는 정예 수군과 대규모 기마 육군 5만 대군을 일으켜 사방으로 고조선을 대대적으로 쳐들어왔습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "한나라 군장", text: "수륙 병진 전술로 고조선 요동 땅을 잿더미로 만들어라!" },
                        { name: "한나라 군사", text: "함대와 철갑 기마 부대, 즉시 출격 완료!" }
                    ]
                })
            },
            {
                cutOrder: 6,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_6.png",
                narration: "그러나 전쟁 초기, 패수 강변에서 맞붙은 고조선의 명장들과 군민들은 한나라 선봉 수군을 대파하고 통쾌한 승리를 맛보았습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "고조선 수장", text: "한나라 수군을 살수와 패수에서 완전히 격퇴했다! 돌격하라!" },
                        { name: "한나라 장군", text: "으아악! 고조선 철기 화살에 우리 대열이 꽁꽁 묶이고 붕괴된다!" }
                    ]
                })
            },
            {
                cutOrder: 7,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_7.png",
                narration: "예상치 못한 패배에 한무제는 장기전 태세로 긴급 전환하여, 고조선 수도 왕검성을 한층 빽빽이 이중 포위했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "한나라 사령관", text: "물 한 모금, 식량 한 줌 들어가지 못하게 왕검성을 이중 삼중 철저히 봉쇄해라!" },
                        { name: "성벽 수비병", text: "적들이 포위망을 굳건히 좁혀오고 있사옵니다!" }
                    ]
                })
            },
            {
                cutOrder: 8,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_8.png",
                narration: "고조선 군민들과 우거왕은 결집하여 철통같은 성벽 위에서 화살과 돌을 쏟아내며 무려 1년 동안 장기 결사항전을 벌였습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "우거왕", text: "왕검성은 절대 무너지지 않는다! 최후의 한 사람까지 이 성을 사수하자!" },
                        { name: "고조선 여인들", text: "성벽 위의 장수들에게 돌과 끓는 물을 날라 도웁시다!" }
                    ]
                })
            },
            {
                cutOrder: 9,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_9.png",
                narration: "긴 포위망에 지친 고조선 지배층 내부의 조선 대신들이 흔들리기 시작했고, 결국 간첩의 이간책에 넘어가 우거왕을 비참히 살해했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "배신자 A", text: "더는 식량도 없고 희망이 없소. 우거왕을 처단하고 한나라에 투항합시다!" },
                        { name: "성기 장군", text: "안 된다! 나라의 대의를 저버리지 마라! 칼을 멈추어라! 으윽!" }
                    ]
                })
            },
            {
                cutOrder: 10,
                imageUrl: "/cartoon/00_prehistory/prehistory_4_fall/cut_10.png",
                narration: "결국 지배층의 참담한 내부 분열로 왕검성이 함락되어 불타버리며, 한반도 최초의 위대한 시원 고대 국가는 장렬히 멸망을 고했습니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "성기 장군", text: "아아, 내부 분열로 한나라 놈들에게 우리 성이 결국 무너지다니... 원통하고 슬프도다!" },
                        { name: "고조선 민중", text: "불타는 왕검성이여, 찬란한 우리 고조선이여... 안녕..." }
                    ]
                })
            }
        ]
    },
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
                imageUrl: "/cartoon/01_three_kingdoms/cut_2.png",
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
                imageUrl: "/cartoon/01_three_kingdoms/cut_3.png",
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
                imageUrl: "/cartoon/01_three_kingdoms/cut_4.png",
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
                imageUrl: "/cartoon/01_three_kingdoms/cut_5.png",
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
                imageUrl: "/cartoon/03_joseon/cut_2.png",
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
                imageUrl: "/cartoon/03_joseon/cut_3.png",
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
                imageUrl: "/cartoon/03_joseon/cut_4.png",
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
                imageUrl: "/cartoon/03_joseon/cut_5.png",
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
                narration: "고종 황제의 의문사로 민족의 서러움 and 분노가 극에 달한 가운데, 민족대표 33인이 독립선언서를 작성하고 탑골공원에서 독립 만세 소리가 울려 퍼집니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "청년 학생", text: "오늘 우리는 인도주의의 인도 하에 정당한 권리로 대한독립만세를 외칩니다!" },
                        { name: "시민들", text: "대한독립만세!! 와아아!! 우리나라는 자주국이다!" }
                    ]
                })
            },
            {
                cutOrder: 2,
                imageUrl: "/cartoon/04_modern/cut_2.png",
                narration: "어린 고등학생이었던 유관순 열사는 고향 천안 아우내 장터로 내려가 수많은 군중들에게 태극기를 나눠주며 역사적인 만세 운동을 직접 주도합니다.",
                dialogue: JSON.stringify({
                    characters: [
                        { name: "유관순", text: "대한독립만세! 나라를 위해 목숨 바쳐 싸웁시다!" },
                        { name: "장터 백성들", text: "만세! 만세! 우리 태극기를 흔들며 일제 놈들에게 우리의 의지를 보여주자!" }
                    ]
                })
            },
            {
                cutOrder: 3,
                imageUrl: "/cartoon/04_modern/cut_3.png",
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
                imageUrl: "/cartoon/04_modern/cut_4.png",
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
        let count = await episodeRepository.count();

        // 10컷 대작 만화로 업데이트하기 위해,
        // 기존 컷들이 10컷 분량으로 시딩되도록 무조건 DB 에포크를 강제로 초기화 및 재시딩 처리합니다!
        // 1회성 마이그레이션이 끝난 뒤 자동으로 8개 에피소드가 채워지게 됩니다.
        const freshSeedTrigger = true; // 무조건 강제 재시딩 활성화!
        if (count !== 8 || freshSeedTrigger) {
            console.log("Forcing database re-seed to apply complete 10-cut masterpiece series...");
            await cutRepository.clear();
            await episodeRepository.clear();
            count = 0;
        }

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
