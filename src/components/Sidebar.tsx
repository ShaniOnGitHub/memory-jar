'use client';

import { Memory } from '@/types/memory';

interface SidebarProps {
    flashback?: Memory;
    onFlashbackClick?: (date: string) => void;
}

export function Sidebar({ flashback, onFlashbackClick }: SidebarProps) {
    const formatDate = (dateStr: string): string => {
        const d = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(d);
    };

    return (
        <aside className="space-y-6">
            {/* Flashback Card */}
            <div className="glass rounded-3xl p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🕰️</span>
                    <h3 className="font-semibold text-foreground">One Month Ago</h3>
                </div>

                {flashback ? (
                    <button
                        onClick={() => onFlashbackClick?.(flashback.date)}
                        className="w-full text-left group"
                    >
                        <div className="rounded-2xl overflow-hidden bg-secondary/50 group-hover:bg-secondary transition-colors">
                            {flashback.imageUrl && (
                                <img
                                    src={flashback.imageUrl}
                                    alt="Flashback memory"
                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            )}
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
                ) : (
                    <div className="rounded-2xl bg-secondary/30 p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                            <span className="text-2xl opacity-50">📭</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No memory from one month ago
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Start journaling to see flashbacks!
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-3xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Quick Tips
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Click any date to add a memory</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Upload photos to capture the moment</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>Track your mood patterns over time</span>
                    </li>
                </ul>
            </div>

            {/* Decorative Element */}
            <div className="hidden lg:block">
                <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/30 p-6 text-center">
                    <div className="text-4xl mb-3 animate-float">🫙</div>
                    <p className="text-sm font-medium text-foreground">Memory Jar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Collecting moments, one day at a time
                    </p>
                </div>
            </div>
        </aside>
    );
}
