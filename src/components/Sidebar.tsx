'use client';

import { useState, useMemo } from 'react';
import { Memory } from '@/types/memory';
import { ImageLightbox } from '@/components/ImageLightbox';

interface SidebarProps {
    flashback?: Memory;
    onFlashbackClick?: (date: string) => void;
    memories?: Memory[];
}

const MOOD_EMOJI: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🤩',
    calm: '😌',
    anxious: '😰',
};

function getStreak(memories: Memory[]): number {
    const dates = [...new Set(memories.map((m) => m.date))].sort().reverse();
    if (dates.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let check = new Date(today + 'T12:00:00');
    for (let i = 0; i < 366; i++) {
        const d = check.toISOString().split('T')[0];
        if (dates.includes(d)) {
            streak++;
            check.setDate(check.getDate() - 1);
        } else {
            if (streak > 0) break;
            check.setDate(check.getDate() - 1);
        }
    }
    return streak;
}

export function Sidebar({ flashback, onFlashbackClick, memories = [] }: SidebarProps) {
    const streak = useMemo(() => getStreak(memories), [memories]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const formatDate = (dateStr: string): string => {
        const d = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(d);
    };

    return (
        <aside className="space-y-5 sm:space-y-8">
            {/* Memory Streak - mobile: compact */}
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">🔥</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{streak}</div>
                <div className="text-xs text-muted-foreground">
                    {streak === 1 ? 'day streak' : 'day streak'}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Keep journaling!</p>
            </div>

            {/* Flashback Card - mobile: tighter padding */}
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 overflow-hidden min-h-[180px] sm:min-h-[200px] flex flex-col">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-lg sm:text-xl">🕰️</span>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">One Month Ago</h3>
                </div>

                {flashback ? (
                    <div className="w-full text-left group">
                        <button
                            onClick={() => onFlashbackClick?.(flashback.date)}
                            className="w-full text-left"
                        >
                            <div className="rounded-2xl overflow-hidden bg-secondary/50 group-hover:bg-secondary transition-colors">
                                {flashback.imageUrl ? (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setLightboxImage(flashback.imageUrl!);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setLightboxImage(flashback.imageUrl!);
                                            }
                                        }}
                                        className="block w-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset rounded-2xl overflow-hidden cursor-pointer"
                                        aria-label="View photo full size"
                                    >
                                        <img
                                            src={flashback.imageUrl}
                                            alt="Flashback memory"
                                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </span>
                                ) : null}
                            <div className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">
                                    {formatDate(flashback.date)}
                                </p>
                                <p className="text-sm text-foreground line-clamp-3 mb-2">
                                    {flashback.note || 'No note for this day'}
                                </p>
                                <div className="flex items-center gap-1">
                                    <span className="text-lg">
                                        {flashback.mood === 'happy' && '😊'}
                                        {flashback.mood === 'sad' && '😢'}
                                        {flashback.mood === 'neutral' && '😐'}
                                        {flashback.mood === 'excited' && '🤩'}
                                        {flashback.mood === 'calm' && '😌'}
                                        {flashback.mood === 'anxious' && '😰'}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        Feeling {flashback.mood}
                                    </span>
                                </div>
                            </div>
                        </div>
                        </button>
                        <ImageLightbox
                            imageUrl={lightboxImage ?? ''}
                            open={lightboxImage !== null}
                            onClose={() => setLightboxImage(null)}
                            alt="Flashback memory"
                        />
                    </div>
                ) : (
                    <div className="rounded-2xl bg-secondary/30 p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
                        {/* Jar silhouette - fills as you add memories */}
                        <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-[0.07]" aria-hidden>
                            <svg width="80" height="100" viewBox="0 0 80 100" fill="none" className="text-foreground">
                                <path d="M15 35 L15 85 Q15 95 40 95 Q65 95 65 85 L65 35 Q65 25 40 15 Q15 25 15 35Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <ellipse cx="40" cy="35" rx="25" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-full bg-muted/80 mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                                <span className="text-3xl opacity-60">🫙</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                No memory from one month ago
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your jar will fill as you journal
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Monthly Insights - bar chart + key metrics */}
            {(() => {
                const now = new Date();
                const thisMonth = memories.filter((m) => {
                    const d = new Date(m.date + 'T00:00:00');
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                const moodCounts = thisMonth.reduce<Record<string, number>>((acc, m) => {
                    acc[m.mood] = (acc[m.mood] || 0) + 1;
                    return acc;
                }, {});
                const wordsWritten = thisMonth.reduce((sum, m) => {
                    return sum + (m.note?.trim().split(/\s+/).filter(Boolean).length || 0);
                }, 0);
                const maxCount = Math.max(1, ...Object.values(moodCounts));
                const moodOrder: (keyof typeof MOOD_EMOJI)[] = ['happy', 'calm', 'neutral', 'excited', 'sad', 'anxious'];

                return (
                    <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                            <span className="text-lg sm:text-xl">📈</span>
                            Monthly Insights
                        </h3>

                        {/* Key metrics */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                            <div className="rounded-xl bg-secondary/50 p-3 text-center">
                                <div className="text-xl font-bold text-foreground">{wordsWritten}</div>
                                <div className="text-xs text-muted-foreground">Words written</div>
                            </div>
                            <div className="rounded-xl bg-secondary/50 p-3 text-center">
                                <div className="text-xl font-bold text-foreground">{thisMonth.length}</div>
                                <div className="text-xs text-muted-foreground">Entries</div>
                            </div>
                        </div>

                        {/* Mood distribution - vertical bar chart */}
                        <p className="text-xs font-medium text-muted-foreground mb-3">Mood distribution</p>
                        <div className="flex items-end justify-between gap-2 h-24">
                            {moodOrder.map((mood) => {
                                const count = moodCounts[mood] ?? 0;
                                const heightPct = maxCount ? (count / maxCount) * 100 : 0;
                                return (
                                    <div key={mood} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className="w-full max-w-[28px] rounded-t-md transition-all duration-500 ease-out min-h-[4px]"
                                            style={{
                                                height: `${Math.max(4, (heightPct / 100) * 72)}px`,
                                                backgroundColor: `var(--mood-${mood})`,
                                            }}
                                        />
                                        <span className="text-[10px] text-muted-foreground" title={`${count} ${mood}`}>
                                            {MOOD_EMOJI[mood]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

        </aside>
    );
}
