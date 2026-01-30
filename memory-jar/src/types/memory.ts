export type Mood = 'happy' | 'sad' | 'neutral' | 'excited' | 'calm' | 'anxious';

export interface Memory {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    note: string;
    mood: Mood;
    imageUrl?: string | null;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface MemoryStore {
    memories: Memory[];
}
