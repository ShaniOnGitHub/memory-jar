import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/memories - Get all memories for the authenticated user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const memories = await prisma.memory.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json({ memories });
    } catch (error) {
        console.error('Error fetching memories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/memories - Create or update a memory
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { date, note, mood, imageUrl } = body;

        if (!date || !mood) {
            return NextResponse.json({ error: 'Date and mood are required' }, { status: 400 });
        }

        // Upsert - create or update based on userId + date
        const memory = await prisma.memory.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date,
                },
            },
            update: {
                note,
                mood,
                imageUrl,
            },
            create: {
                userId: session.user.id,
                date,
                note: note || '',
                mood,
                imageUrl,
            },
        });

        return NextResponse.json({ memory });
    } catch (error) {
        console.error('Error saving memory:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/memories - Delete a memory
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
        }

        // Verify ownership before deleting
        const memory = await prisma.memory.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!memory) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
        }

        await prisma.memory.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting memory:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
