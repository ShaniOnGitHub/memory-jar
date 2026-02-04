'use client';

/**
 * Voice note recording + transcription (OpenAI or browser Web Speech API).
 * Not used in the app for now — re-enable by adding <VoiceRecord /> in JournalForm.tsx.
 */
import { useState, useRef, useCallback } from 'react';

interface VoiceRecordProps {
    onSaveTranscript: (text: string) => Promise<void>;
    disabled?: boolean;
}

const SpeechRecognitionAPI =
    typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;

export function VoiceRecord({ onSaveTranscript, disabled }: VoiceRecordProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'ready' | 'saving' | 'error'>('idle');
    const [transcript, setTranscript] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const chunksRef = useRef<Blob[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const browserTranscriptRef = useRef<string[]>([]);
    const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionAPI>> | null>(null);

    const startRecording = useCallback(async () => {
        if (disabled) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];
            browserTranscriptRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
            };

            recorder.start(100);
            mediaRecorderRef.current = recorder;

            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = 'en-US';
                recognition.onresult = (e: SpeechRecognitionEvent) => {
                    const last = e.results.length - 1;
                    const phrase = e.results[last][0].transcript;
                    if (e.results[last].isFinal) browserTranscriptRef.current.push(phrase);
                };
                recognition.onerror = () => {};
                recognition.start();
                recognitionRef.current = recognition;
            }

            setStatus('recording');
            setErrorMessage('');
            setTranscript('');
        } catch (e) {
            setErrorMessage('Microphone access denied or unavailable.');
            setStatus('error');
        }
    }, [disabled]);

    const stopRecording = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || status !== 'recording') return;

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
            recognitionRef.current = null;
        }

        recorder.stop();
        mediaRecorderRef.current = null;

        await new Promise<void>((resolve) => {
            recorder.onstop = () => resolve();
        });

        setStatus('transcribing');

        const browserText = browserTranscriptRef.current.join(' ').trim();

        try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (res.status === 503) {
                if (browserText) {
                    setTranscript(browserText);
                    setStatus('ready');
                } else if (SpeechRecognitionAPI) {
                    setTranscript('(No speech detected)');
                    setStatus('ready');
                } else {
                    setErrorMessage('Voice transcription is not configured. Add OPENAI_API_KEY to enable, or use Chrome/Edge for free browser transcription.');
                    setStatus('error');
                }
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (browserText) {
                    setTranscript(browserText);
                    setStatus('ready');
                } else {
                    throw new Error((data as { error?: string }).error || 'Transcription failed');
                }
                return;
            }

            const data = (await res.json()) as { text?: string };
            const text = data.text?.trim() || browserText || '(No speech detected)';
            setTranscript(text);
            setStatus('ready');
        } catch (e) {
            if (browserText) {
                setTranscript(browserText);
                setStatus('ready');
            } else {
                setErrorMessage(e instanceof Error ? e.message : 'Transcription failed');
                setStatus('error');
            }
        }
    }, [status]);

    const handleSave = async () => {
        if (!transcript.trim() || status !== 'ready') return;
        setStatus('saving');
        try {
            await onSaveTranscript(transcript);
            setTranscript('');
            setStatus('idle');
        } catch {
            setStatus('ready');
        }
    };

    const reset = () => {
        setStatus('idle');
        setTranscript('');
        setErrorMessage('');
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="text-lg">🎤</span>
                    Voice note
                </h4>
                {(status === 'ready' || status === 'error') && (
                    <button
                        type="button"
                        onClick={reset}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        New
                    </button>
                )}
            </div>

            {status === 'idle' && (
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={disabled}
                    className="w-full py-3 rounded-xl bg-accent/20 text-accent-foreground font-medium hover:bg-accent/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <span>Start recording</span>
                </button>
            )}

            {status === 'recording' && (
                <div className="flex items-center justify-center gap-3 py-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" aria-hidden />
                    <span className="text-sm text-muted-foreground">Recording…</span>
                    <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
                    >
                        Stop
                    </button>
                </div>
            )}

            {status === 'transcribing' && (
                <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">Transcribing your audio…</p>
                    <p className="text-xs text-muted-foreground mt-1">Preparing your note for the jar.</p>
                </div>
            )}

            {status === 'ready' && (
                <div className="space-y-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{transcript}</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90"
                        >
                            Save to Jar
                        </button>
                        <button type="button" onClick={reset} className="px-4 py-2 rounded-xl border border-border text-sm">
                            Discard
                        </button>
                    </div>
                </div>
            )}

            {status === 'saving' && (
                <p className="text-sm text-muted-foreground text-center py-2">Saving…</p>
            )}

            {status === 'error' && (
                <div className="space-y-2">
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                    <button type="button" onClick={reset} className="text-sm text-accent">
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
}
