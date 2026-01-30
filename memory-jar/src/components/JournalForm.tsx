'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Memory, Mood } from '@/types/memory';

interface JournalFormProps {
    date: string;
    existingMemory?: Memory;
    onSave: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
    onDelete?: (id: string) => void;
    onClose: () => void;
}

const MOODS: { value: Mood; emoji: string; label: string }[] = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
];

export function JournalForm({ date, existingMemory, onSave, onDelete, onClose }: JournalFormProps) {
    const [note, setNote] = useState(existingMemory?.note || '');
    const [mood, setMood] = useState<Mood>(existingMemory?.mood || 'neutral');
    const [imageUrl, setImageUrl] = useState<string | undefined>(existingMemory?.imageUrl || undefined);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDisplayDate = (dateStr: string): string => {
        const d = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(d);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            date,
            note,
            mood,
            imageUrl,
        });
        onClose();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = () => {
        setImageUrl(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/30 to-accent/30 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">
                                {existingMemory ? 'Edit Memory' : 'New Memory'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formatDisplayDate(date)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-background/50 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Mood Selector */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-3">
                            How are you feeling?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMood(m.value)}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300
                    ${mood === m.value
                                            ? 'border-accent bg-accent/20 scale-105'
                                            : 'border-border hover:border-accent/50 hover:bg-secondary'
                                        }
                  `}
                                >
                                    <span className="text-xl">{m.emoji}</span>
                                    <span className="text-sm font-medium">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-muted-foreground mb-2">
                            What happened today?
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write about your day..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Add a photo
                        </label>
                        {imageUrl ? (
                            <div className="relative inline-block py-3">
                                <img
                                    src={imageUrl}
                                    alt="Memory preview"
                                    className="max-w-[40px] max-h-[40px] object-cover rounded-lg shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 p-1.5 bg-background border border-border rounded-full hover:bg-secondary transition-colors shadow-sm"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging
                                        ? 'border-accent bg-accent/10'
                                        : 'border-border hover:border-accent/50 hover:bg-secondary/50'
                                    }
                `}
                            >
                                <svg className="w-10 h-10 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-muted-foreground">
                                    Drag & drop an image or <span className="text-accent font-medium">browse</span>
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {existingMemory && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(existingMemory.id);
                                    onClose();
                                }}
                                className="px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium shadow-lg hover:shadow-xl"
                        >
                            Save Memory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
