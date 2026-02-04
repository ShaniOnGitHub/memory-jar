/**
 * Voice transcription API (OpenAI Whisper). Used by VoiceRecord when OPENAI_API_KEY is set.
 * Voice note feature is disabled for now; this route remains for when we re-enable it.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Voice transcription is not configured. Add OPENAI_API_KEY to enable.' },
                { status: 503 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('audio') as File | null;
        if (!file || !file.size) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'audio/webm' });
        const fd = new FormData();
        fd.append('file', blob, 'recording.webm');
        fd.append('model', 'whisper-1');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: fd,
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('Whisper API error:', res.status, err);
            return NextResponse.json(
                { error: 'Transcription failed' },
                { status: 502 }
            );
        }

        const data = (await res.json()) as { text?: string };
        const text = data.text?.trim() || '';

        return NextResponse.json({ text });
    } catch (e) {
        console.error('Transcribe error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
