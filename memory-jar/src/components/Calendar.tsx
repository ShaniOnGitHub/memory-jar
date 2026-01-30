'use client';

import { useState, useMemo } from 'react';
import { Memory, Mood } from '@/types/memory';

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

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Calendar({ memories, onDateClick }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

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
        cells.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(day);
        const memory = memoriesMap.get(dateStr);
        const today = isToday(day);

        cells.push(
            <button
                key={day}
                onClick={() => onDateClick(dateStr)}
                className={`
          aspect-square rounded-xl p-1 relative overflow-hidden
          transition-all duration-300 hover:scale-105 hover:shadow-lg
          ${today ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
          ${memory ? `border-3 ${MOOD_COLORS[memory.mood]} bg-card shadow-md` : 'border border-border bg-card/50 hover:bg-card'}
        `}
            >
                {/* Day Number */}
                <span
                    className={`
            absolute top-1 left-2 text-xs font-medium
            ${today ? 'text-accent' : 'text-muted-foreground'}
          `}
                >
                    {day}
                </span>

                {/* Memory Thumbnail */}
                {memory && (
                    <div className="absolute inset-0 flex items-center justify-center pt-3">
                        {memory.imageUrl ? (
                            <img
                                src={memory.imageUrl}
                                alt={`Memory for ${dateStr}`}
                                className="w-[70%] h-[70%] object-cover rounded-lg shadow-sm"
                            />
                        ) : (
                            <span className="text-lg">
                                {memory.mood === 'happy' && '😊'}
                                {memory.mood === 'sad' && '😢'}
                                {memory.mood === 'neutral' && '😐'}
                                {memory.mood === 'excited' && '🤩'}
                                {memory.mood === 'calm' && '😌'}
                                {memory.mood === 'anxious' && '😰'}
                            </span>
                        )}
                    </div>
                )}
            </button>
        );
    }

    return (
        <div className="glass rounded-3xl p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                        aria-label="Previous month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-xl md:text-2xl font-semibold">
                        {monthName} {year}
                    </h2>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                        aria-label="Next month"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors"
                >
                    Today
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {cells}
            </div>

            {/* Mood Legend */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {(Object.keys(MOOD_COLORS) as Mood[]).map((mood) => (
                    <div key={mood} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full border-2 ${MOOD_COLORS[mood]}`} />
                        <span className="text-xs text-muted-foreground capitalize">{mood}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
