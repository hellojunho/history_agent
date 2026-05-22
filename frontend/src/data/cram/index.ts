import { prehistoryQuizzes } from "./prehistory";
import { threeKingdomsQuizzes } from "./threeKingdoms";
import { unifiedSillaQuizzes } from "./unifiedSilla";
import { goryeoQuizzes } from "./goryeo";
import { earlyJoseonQuizzes } from "./earlyJoseon";
import { lateJoseonQuizzes } from "./lateJoseon";
import { portOpeningQuizzes } from "./portOpening";
import { japaneseColonialQuizzes } from "./japaneseColonial";
import { modernQuizzes } from "./modern";
import { CramQuestion } from "../cramQuizzes";

export const cramQuizzes: CramQuestion[] = [
    ...prehistoryQuizzes,
    ...threeKingdomsQuizzes,
    ...unifiedSillaQuizzes,
    ...goryeoQuizzes,
    ...earlyJoseonQuizzes,
    ...lateJoseonQuizzes,
    ...portOpeningQuizzes,
    ...japaneseColonialQuizzes,
    ...modernQuizzes
];
