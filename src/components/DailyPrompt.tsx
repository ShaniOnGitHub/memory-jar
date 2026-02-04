'use client';

const PROMPTS = [
    'What made you smile today?',
    'One thing you learned today?',
    'A moment you want to remember.',
    'What are you grateful for right now?',
    'Who made your day better?',
    'What would you tell your future self about today?',
    'Describe today in one word.',
    'What are you proud of today?',
    'A small win from today.',
    'What felt good today?',
    'Something you want to let go of.',
    'What are you looking forward to?',
    'A detail you noticed today.',
    'What made today unique?',
    'How did you take care of yourself today?',
];

export function DailyPrompt() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const prompt = PROMPTS[dayOfYear % PROMPTS.length];

    return (
        <div className="w-full max-w-2xl mx-auto rounded-full bg-[#ede5d9] dark:bg-secondary/80 border border-border/80 shadow-sm px-6 py-4 text-center transition-opacity duration-300">
            <p className="text-base md:text-lg font-medium text-foreground italic">
                “{prompt}”
            </p>
        </div>
    );
}
