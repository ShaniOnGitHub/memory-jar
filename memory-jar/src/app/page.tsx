'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { Calendar } from '@/components/Calendar';
import { JournalForm } from '@/components/JournalForm';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMemories } from '@/hooks/useMemories';
import { Memory } from '@/types/memory';

export default function Home() {
  const {
    memories,
    isLoaded,
    addMemory,
    updateMemory,
    deleteMemory,
    getMemoryByDate,
    getFlashback,
  } = useMemories();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | undefined>(undefined);

  const handleDateClick = (date: string) => {
    const existing = getMemoryByDate(date);
    setEditingMemory(existing);
    setSelectedDate(date);
  };

  const handleSave = async (memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingMemory) {
      await updateMemory(editingMemory.id, memoryData);
    } else {
      await addMemory(memoryData);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMemory(id);
  };

  const handleCloseForm = () => {
    setSelectedDate(null);
    setEditingMemory(undefined);
  };

  const flashback = getFlashback();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 animate-pulse-soft" />
          <p className="text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🫙</span>
              <span className="font-semibold text-lg text-foreground">Memory Jar</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <Hero />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar - spans 3 columns on large screens */}
          <div className="lg:col-span-3">
            <Calendar memories={memories} onDateClick={handleDateClick} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              flashback={flashback}
              onFlashbackClick={handleDateClick}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Made with 💜 for preserving precious moments</p>
            <p className="mt-1">Memory Jar © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      {/* Journal Form Modal */}
      {selectedDate && (
        <JournalForm
          date={selectedDate}
          existingMemory={editingMemory}
          onSave={handleSave}
          onDelete={editingMemory ? handleDelete : undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
