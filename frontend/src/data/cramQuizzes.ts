export interface CramQuestion {
    id: string;
    questionNumber: number;
    contentText: string;
    choices: string[];
    answer: number; // 1-indexed (1 to 4)
    explanation: string;
    era: string;
    topic: string;
    imagePath?: string;
}

import { cramQuizzes as importedQuizzes } from "./cram";

export const cramQuizzes: CramQuestion[] = importedQuizzes;
