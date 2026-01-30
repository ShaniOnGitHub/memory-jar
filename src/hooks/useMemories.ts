'use client';

import { useState, useEffect, useCallback } from 'react';
import { Memory } from '@/types/memory';

const STORAGE_KEY = 'memory-jar-memories';

export function useMemories() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load memories from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setMemories(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load memories:', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever memories change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
        }
    }, [memories, isLoaded]);

    const addMemory = useCallback(async (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        const newMemory: Memory = {
            ...memory,
            id: crypto.randomUUID(),
            userId: 'local-user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

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
    }, []);

    const updateMemory = useCallback(async (id: string, updates: Partial<Memory>) => {
        setMemories((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m))
        );
    }, []);

    const deleteMemory = useCallback(async (id: string) => {
        setMemories((prev) => prev.filter((m) => m.id !== id));
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
