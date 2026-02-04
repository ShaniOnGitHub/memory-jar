'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory } from '@/types/memory';

export function useMemories() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMemories = useCallback(async () => {
        setError(null);
        setIsLoaded(false);
        try {
            const res = await fetch('/api/memories');
            if (!res.ok) {
                if (res.status === 401) {
                    setIsLoaded(true);
                    return;
                }
                setError('Something went wrong — give it another try.');
                setMemories([]);
                setIsLoaded(true);
                return;
            }
            const data = await res.json();
            setMemories(data.memories || []);
        } catch (e) {
            console.error('Failed to fetch memories:', e);
            setError('Something went wrong — give it another try.');
            setMemories([]);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchMemories();
    }, [fetchMemories]);

    const addMemory = useCallback(async (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        try {
            const res = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memory),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = (data as { error?: string })?.error || res.statusText || 'Failed to save memory';
                throw new Error(msg);
            }

            const data = await res.json();
            const newMemory = data.memory;

            setMemories((prev) => {
                const existingIndex = prev.findIndex((m) => m.date === newMemory.date);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = newMemory;
                    return updated;
                }
                return [...prev, newMemory];
            });

            return newMemory;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to save memory';
            console.error('Failed to save memory:', e);
            setError(message);
            throw e;
        }
    }, []);

    const updateMemory = useCallback(async (id: string, updates: Partial<Memory>) => {
        const existing = memories.find((m) => m.id === id);
        if (!existing) return;

        try {
            const res = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...existing, ...updates }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = (data as { error?: string })?.error || res.statusText || 'Failed to update memory';
                throw new Error(msg);
            }

            const data = await res.json();
            setMemories((prev) =>
                prev.map((m) => (m.id === id ? data.memory : m))
            );
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to update memory';
            console.error('Failed to update memory:', e);
            setError(message);
        }
    }, [memories]);

    const deleteMemory = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/memories?id=${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete memory');

            setMemories((prev) => prev.filter((m) => m.id !== id));
        } catch (e) {
            console.error('Failed to delete memory:', e);
            setError('Failed to delete memory');
        }
    }, []);

    const getMemoryByDate = useCallback(
        (date: string): Memory | undefined => {
            return memories.find((m) => m.date === date);
        },
        [memories]
    );

    const getMemoriesForMonth = useCallback(
        (year: number, month: number): Memory[] => {
            return memories.filter((m) => {
                const d = new Date(m.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        },
        [memories]
    );

    const getFlashback = useCallback((): Memory | undefined => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const dateStr = oneMonthAgo.toISOString().split('T')[0];
        return memories.find((m) => m.date === dateStr);
    }, [memories]);

    return {
        memories,
        isLoaded,
        error,
        refetch: fetchMemories,
        addMemory,
        updateMemory,
        deleteMemory,
        getMemoryByDate,
        getMemoriesForMonth,
        getFlashback,
    };
}
