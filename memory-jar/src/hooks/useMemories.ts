'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory } from '@/types/memory';

export function useMemories() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch memories from API on mount
    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await fetch('/api/memories');
                if (!res.ok) {
                    if (res.status === 401) {
                        // Not authenticated - this is expected before login
                        setIsLoaded(true);
                        return;
                    }
                    throw new Error('Failed to fetch memories');
                }
                const data = await res.json();
                setMemories(data.memories || []);
            } catch (e) {
                console.error('Failed to fetch memories:', e);
                setError('Failed to load memories');
            } finally {
                setIsLoaded(true);
            }
        };

        fetchMemories();
    }, []);

    const addMemory = useCallback(async (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        try {
            const res = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memory),
            });

            if (!res.ok) throw new Error('Failed to save memory');

            const data = await res.json();
            const newMemory = data.memory;

            // Check if updating existing or adding new
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
            console.error('Failed to save memory:', e);
            setError('Failed to save memory');
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

            if (!res.ok) throw new Error('Failed to update memory');

            const data = await res.json();
            setMemories((prev) =>
                prev.map((m) => (m.id === id ? data.memory : m))
            );
        } catch (e) {
            console.error('Failed to update memory:', e);
            setError('Failed to update memory');
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
        addMemory,
        updateMemory,
        deleteMemory,
        getMemoryByDate,
        getMemoriesForMonth,
        getFlashback,
    };
}
