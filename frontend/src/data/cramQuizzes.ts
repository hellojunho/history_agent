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

// Simple Seeded Pseudo-Random Number Generator (Mulberry32)
function getSeededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (h << 5) - h + seed.charCodeAt(i);
        h |= 0;
    }
    return function() {
        let t = h += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffleChoicesDeterministic(question: CramQuestion): CramQuestion {
    const originalAnswerIndex = question.answer - 1;
    if (originalAnswerIndex < 0 || originalAnswerIndex >= question.choices.length) {
        return question;
    }
    const correctText = question.choices[originalAnswerIndex];
    
    // Seed by id or contentText to ensure unique sequence per question
    const seed = question.id || question.contentText;
    const rand = getSeededRandom(seed);
    
    // Create items with original choice text and correct flag
    const items = question.choices.map((choice, i) => ({ 
        choice, 
        isCorrect: i === originalAnswerIndex 
    }));
    
    // Fisher-Yates Shuffle
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
    }
    
    const newChoices = items.map(item => item.choice);
    const newAnswerIndex = items.findIndex(item => item.isCorrect);
    
    return {
        ...question,
        choices: newChoices,
        answer: newAnswerIndex + 1
    };
}

export const cramQuizzes: CramQuestion[] = importedQuizzes.map(shuffleChoicesDeterministic);
