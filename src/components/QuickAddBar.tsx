'use client';

import { useState } from 'react';

interface QuickAddBarProps {
    onQuickAdd: (note: string, mood?: string) => Promise<void>;
    disabled?: boolean;
}

const EMOJI_OPTIONS: { emoji: string; mood: string }[] = [
    { emoji: '😊', mood: 'happy' },
    { emoji: '😢', mood: 'sad' },
    { emoji: '😐', mood: 'neutral' },
    { emoji: '🤩', mood: 'excited' },
    { emoji: '😌', mood: 'calm' },
    { emoji: '😰', mood: 'anxious' },
];

export function QuickAddBar({ onQuickAdd, disabled }: QuickAddBarProps) {
    const [text, setText] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || saving || disabled) return;
        setSaving(true);
        try {
            await onQuickAdd(value);
            setText('');
            setExpanded(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEmojiClick = async (item: { emoji: string; mood: string }) => {
        if (saving || disabled) return;
        setSaving(true);
        try {
            await onQuickAdd(item.emoji, item.mood);
            setExpanded(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed right-6 sm:right-8 z-20 flex flex-col items-end gap-3"
            style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {expanded && (
                <form
                    onSubmit={handleSubmit}
                    className="glass rounded-2xl p-3 shadow-xl border border-border flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)] animate-fade-in"
                >
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Quick note for today…"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        autoFocus
                        disabled={saving}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {EMOJI_OPTIONS.map((item) => (
                                <button
                                    key={item.mood}
                                    type="button"
                                    onClick={() => handleEmojiClick(item)}
                                    className="min-h-[44px] min-w-[44px] p-2 rounded-xl hover:bg-secondary transition-colors text-lg disabled:opacity-50 touch-manipulation"
                                    disabled={saving}
                                    title={`Quick add: ${item.mood}`}
                                >
                                    {item.emoji}
                                </button>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={!text.trim() || saving}
                            className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {saving ? '…' : 'Add'}
                        </button>
                    </div>
                </form>
            )}
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="min-h-[44px] min-w-[44px] w-12 h-12 rounded-full bg-secondary border border-border shadow-card hover:shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-105 touch-manipulation"
                title="Quick add (text or emoji)"
                aria-label="Quick add"
            >
                ✏️
            </button>
        </div>
    );
}
