'use client';

import { useEffect } from 'react';

interface ImageLightboxProps {
    imageUrl: string;
    open: boolean;
    onClose: () => void;
    alt?: string;
}

export function ImageLightbox({ imageUrl, open, onClose, alt = 'Full size' }: ImageLightboxProps) {
    useEffect(() => {
        if (!open) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onEscape);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 sm:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Photo full size view"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/95 hover:bg-white text-black shadow-lg border border-white/50 transition-colors z-10"
                aria-label="Close"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <img
                src={imageUrl}
                alt={alt}
                className="max-h-[58vh] max-w-[min(88vw,380px)] w-auto h-auto object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
