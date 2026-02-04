'use client';

import { useState, useMemo } from 'react';
import { Memory, Mood } from '@/types/memory';
import { ImageLightbox } from '@/components/ImageLightbox';

interface CalendarProps {
    memories: Memory[];
    onDateClick: (date: string) => void;
}

const MOOD_COLORS: Record<Mood, string> = {
    happy: 'border-mood-happy',
    sad: 'border-mood-sad',
    neutral: 'border-mood-neutral',
    excited: 'border-mood-excited',
    calm: 'border-mood-calm',
    anxious: 'border-mood-anxious',
};

const MOOD_EMOJI: Record<Mood, string> = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🤩',
    calm: '😌',
    anxious: '😰',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Calendar({ memories, onDateClick }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const { year, month, daysInMonth, firstDayOfWeek, memoriesMap } = useMemo(() => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        const days = new Date(y, m + 1, 0).getDate();
        // Adjust for Monday start: getDay() returns 0=Sun, 1=Mon, etc.
        // Convert to 0=Mon, 1=Tue, ..., 6=Sun
        const dayOfWeek = new Date(y, m, 1).getDay();
        const firstDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Create a map of date -> memory for quick lookup
        const map = new Map<string, Memory>();
        memories.forEach((mem) => {
            map.set(mem.date, mem);
        });

        return {
            year: y,
            month: m,
            daysInMonth: days,
            firstDayOfWeek: firstDay,
            memoriesMap: map,
        };
    }, [currentDate, memories]);

    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatDateString = (day: number): string => {
        const m = (month + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    // Generate calendar cells
    const cells = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push(<div key={`empty-${i}`} className="aspect-[1/1.28]" />);
    }

    // Day cells with hover peek and micro preview
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(day);
        const memory = memoriesMap.get(dateStr);
        const today = isToday(day);
        const previewText = memory?.note ? (memory.note.slice(0, 40) + (memory.note.length > 40 ? '…' : '')) : '';
        const hoverLabel = memory
            ? `${MOOD_EMOJI[memory.mood]} ${previewText || 'No note'}`
            : 'Click to add memory';

        cells.push(
            <button
                key={day}
                onClick={() => onDateClick(dateStr)}
                title={hoverLabel}
                className={`
          group aspect-[1/1.28] min-h-[44px] min-w-[44px] rounded-xl p-1 relative overflow-visible
          transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg touch-manipulation
          ${today ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
          ${memory ? `border-3 ${MOOD_COLORS[memory.mood]} bg-card shadow-card` : 'border border-border bg-card/50 hover:bg-card'}
        `}
            >
                {/* Day Number */}
                <span
                    className={`
            absolute top-1 left-2 text-xs font-medium z-10
            ${today ? 'text-accent' : 'text-muted-foreground'}
          `}
                >
                    {day}
                </span>

                {/* Memory: mood emoji or photo thumbnail (taller so image has more height) */}
                {memory && (
                    <div className="absolute inset-0 flex items-center justify-center pt-3">
                        {memory.imageUrl ? (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage(memory.imageUrl!);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setLightboxImage(memory.imageUrl!);
                                    }
                                }}
                                className="block w-[70%] h-[80%] rounded-lg shadow-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 cursor-pointer"
                                aria-label="View photo full size"
                            >
                                <img
                                    src={memory.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </span>
                        ) : (
                            <span className="text-lg" aria-hidden>
                                {MOOD_EMOJI[memory.mood]}
                            </span>
                        )}
                    </div>
                )}

                {/* Hover peek: photo thumbnail for dates with image */}
                {memory?.imageUrl && (
                    <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 h-24 rounded-xl overflow-hidden shadow-xl border-2 border-border opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20"
                        aria-hidden
                    >
                        <img src={memory.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                {/* Hover micro preview: mood + first line (tooltip) */}
                {memory && !memory.imageUrl && (
                    <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-lg bg-card border border-border shadow-lg text-xs text-foreground whitespace-nowrap max-w-[140px] truncate opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20"
                        aria-hidden
                    >
                        {MOOD_EMOJI[memory.mood]} {previewText || 'No note'}
                    </div>
                )}
            </button>
        );
    }

    return (
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
            {/* Header - mobile: compact, clear tap targets */}
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={goToPrevMonth}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation"
                        aria-label="Previous month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
                        {monthName} {year}
                    </h2>
                    <button
                        onClick={goToNextMonth}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-full hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation"
                        aria-label="Next month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="shrink-0 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors touch-manipulation active:bg-accent/40"
                >
                    Today
                </button>
            </div>

            {/* Weekday Headers - mobile: slightly smaller */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider py-1.5 sm:py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - mobile: smaller gap for larger tap areas */}
            <div key={`${year}-${month}`} className="grid grid-cols-7 gap-1.5 sm:gap-2 animate-fade-in">
                {cells}
            </div>

            <ImageLightbox
                imageUrl={lightboxImage ?? ''}
                open={lightboxImage !== null}
                onClose={() => setLightboxImage(null)}
                alt="Memory photo"
            />

            {/* Mood Legend - mobile: compact */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
                {(Object.keys(MOOD_COLORS) as Mood[]).map((mood) => (
                    <div key={mood} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${MOOD_COLORS[mood]}`} />
                        <span className="text-[10px] sm:text-xs text-muted-foreground capitalize">{mood}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
