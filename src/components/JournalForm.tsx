'use client';

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { Memory, Mood } from '@/types/memory';
// Voice note: VoiceRecord component disabled for now; see @/components/VoiceRecord.tsx and api/transcribe/route.ts

interface JournalFormProps {
    date: string;
    existingMemory?: Memory;
    onSave: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void | Promise<void>;
    onDelete?: (id: string) => void;
    onClose: () => void;
}

const MOODS: { value: Mood; emoji: string; label: string }[] = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
];

const MAX_IMAGE_PX = 960;
const JPEG_QUALITY = 0.75;
const SMALL_FILE_BYTES = 180000;

function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            let dw = w;
            let dh = h;
            if (w > MAX_IMAGE_PX || h > MAX_IMAGE_PX) {
                if (w >= h) {
                    dw = MAX_IMAGE_PX;
                    dh = Math.round((h * MAX_IMAGE_PX) / w);
                } else {
                    dh = MAX_IMAGE_PX;
                    dw = Math.round((w * MAX_IMAGE_PX) / h);
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = dw;
            canvas.height = dh;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas not supported'));
                return;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            ctx.drawImage(img, 0, 0, dw, dh);
            try {
                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                resolve(dataUrl);
            } catch {
                reject(new Error('Failed to compress image'));
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}

export function JournalForm({ date, existingMemory, onSave, onDelete, onClose }: JournalFormProps) {
    const [note, setNote] = useState(existingMemory?.note ?? '');
    const [mood, setMood] = useState<Mood>(existingMemory?.mood === 'neutral' ? 'calm' : (existingMemory?.mood || 'calm'));
    const [imageUrl, setImageUrl] = useState<string | undefined>(existingMemory?.imageUrl || undefined);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedToast, setSavedToast] = useState(false);
    const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLTextAreaElement>(null);
    const pendingFileRef = useRef<File | null>(null);

    useEffect(() => {
        if (!photoLightboxOpen) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPhotoLightboxOpen(false);
        };
        document.addEventListener('keydown', onEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onEscape);
            document.body.style.overflow = '';
        };
    }, [photoLightboxOpen]);

    useEffect(() => {
        noteInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!photoLightboxOpen && !showDeleteConfirm) {
            const onEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', onEscape);
            return () => document.removeEventListener('keydown', onEscape);
        }
    }, [photoLightboxOpen, showDeleteConfirm, onClose]);

    const formatDisplayDate = (dateStr: string): string => {
        const d = new Date(dateStr + 'T00:00:00');
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(d);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let finalImageUrl = imageUrl;
        if (typeof imageUrl === 'string' && imageUrl.startsWith('blob:') && pendingFileRef.current) {
            setIsCompressing(true);
            try {
                finalImageUrl = await compressImage(pendingFileRef.current);
            } catch {
                const reader = new FileReader();
                finalImageUrl = await new Promise<string>((resolve) => {
                    reader.onload = (ev) => resolve(ev.target?.result as string);
                    reader.readAsDataURL(pendingFileRef.current!);
                });
            }
            setIsCompressing(false);
        }
        setIsSaving(true);
        try {
            await Promise.resolve(
                onSave({
                    date,
                    note: note.trim(),
                    mood,
                    imageUrl: finalImageUrl,
                })
            );
            setSavedToast(true);
            setTimeout(() => onClose(), 1200);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        pendingFileRef.current = file;
        const objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);
        if (file.size <= SMALL_FILE_BYTES) {
            const reader = new FileReader();
            reader.onload = (e) => {
                URL.revokeObjectURL(objectUrl);
                setImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            return;
        }
        try {
            const dataUrl = await compressImage(file);
            URL.revokeObjectURL(objectUrl);
            setImageUrl(dataUrl);
        } catch {
            const reader = new FileReader();
            reader.onload = (e) => {
                URL.revokeObjectURL(objectUrl);
                setImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
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
        pendingFileRef.current = null;
        if (typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
        setImageUrl(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:py-12">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal: max height so there's always a gap top and bottom */}
            <div className="relative w-full max-w-lg max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] bg-card rounded-2xl shadow-elevated overflow-hidden animate-fade-in flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-primary/30 to-accent/30 p-6 pb-4">
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
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                    {/* Mood Selector - radio style (Happy, Sad, Neutral, …) */}
                    <div>
                        <div className="flex flex-nowrap items-center justify-center gap-3 sm:gap-5">
                            {MOODS.map((m) => (
                                <label
                                    key={m.value}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="mood"
                                        value={m.value}
                                        checked={mood === m.value}
                                        onChange={() => setMood(m.value)}
                                        className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 text-accent focus:ring-accent focus:ring-offset-2"
                                    />
                                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-muted-foreground mb-2">
                            What happened today?
                        </label>
                        <textarea
                            ref={noteInputRef}
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write about your day..."
                            rows={3}
                            className="note-textarea w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
                        />
                    </div>

                    {/* Voice note disabled for now — re-enable by importing VoiceRecord and rendering it here */}

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Add a photo
                        </label>
                        {imageUrl ? (
                            <div className="relative inline-block py-3">
                                <button
                                    type="button"
                                    onClick={() => setPhotoLightboxOpen(true)}
                                    className="block rounded-lg shadow-md overflow-hidden ring-2 ring-transparent hover:ring-accent/50 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                                    aria-label="View full size"
                                >
                                    <img
                                        src={imageUrl}
                                        alt="Memory preview"
                                        className="max-w-[40px] max-h-[40px] w-10 h-10 object-cover"
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 p-1.5 bg-background border border-border rounded-full hover:bg-secondary transition-colors shadow-sm z-10"
                                    aria-label="Remove photo"
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
                    </div>

                    {/* Actions - fixed at bottom of modal */}
                    <div className="flex-shrink-0 flex gap-3 p-6 pt-4 border-t border-border">
                        {existingMemory && onDelete && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-1" />
                        {savedToast && (
                            <span className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium" aria-live="polite">
                                Saved!
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCompressing || isSaving}
                            className="px-6 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSaving ? 'Saving…' : isCompressing ? 'Preparing photo…' : 'Save Memory'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Photo full-size lightbox */}
            {photoLightboxOpen && imageUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 sm:p-6"
                    onClick={() => setPhotoLightboxOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo full size view"
                >
                    <button
                        type="button"
                        onClick={() => setPhotoLightboxOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/95 hover:bg-white text-black shadow-lg border border-white/50 transition-colors z-10"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={imageUrl}
                        alt="Memory photo full size"
                        className="max-h-[58vh] max-w-[min(88vw,380px)] w-auto h-auto object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Delete confirmation */}
            {showDeleteConfirm && existingMemory && onDelete && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setShowDeleteConfirm(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-confirm-title"
                >
                    <div
                        className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="delete-confirm-title" className="text-lg font-semibold text-foreground">
                            Delete this memory?
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            This can&apos;t be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 rounded-xl border border-border hover:bg-secondary font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(existingMemory.id);
                                    setShowDeleteConfirm(false);
                                    onClose();
                                }}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
