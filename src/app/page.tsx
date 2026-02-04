'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut, getSession } from 'next-auth/react';
import { Hero } from '@/components/Hero';
import { Calendar } from '@/components/Calendar';
import { JournalForm } from '@/components/JournalForm';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { QuickAddBar } from '@/components/QuickAddBar';
import { useMemories } from '@/hooks/useMemories';
import { Memory } from '@/types/memory';

export default function Home() {
  const { data: session, status } = useSession();

  // After login redirect, session can be stale — refetch so nav shows email & Log out
  useEffect(() => {
    getSession({ triggerEvent: true }).then(() => {});
  }, []);
  const {
    memories,
    isLoaded,
    error,
    refetch,
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

  const todayStr = new Date().toISOString().split('T')[0];

  const openQuickAdd = () => {
    handleDateClick(todayStr);
  };

  const handleQuickAddNote = async (note: string, mood?: string) => {
    const existing = getMemoryByDate(todayStr);
    const payload = {
      date: todayStr,
      note: note.trim() || 'Quick note',
      mood: (mood ?? existing?.mood ?? 'neutral') as Memory['mood'],
      imageUrl: existing?.imageUrl ?? undefined,
    };
    if (existing) {
      await updateMemory(existing.id, payload);
    } else {
      await addMemory(payload);
    }
  };

  const flashback = getFlashback();
  const recentMood = memories.length > 0 ? memories[0].mood : null;

  const calendarRef = useRef<HTMLDivElement>(null);
  const [sidebarMaxHeight, setSidebarMaxHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setSidebarMaxHeight(el.offsetHeight);
    });
    observer.observe(el);
    setSidebarMaxHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, [memories]);

  // Loading state: skeleton matching main layout so it doesn't jump
  if (!isLoaded && !error) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-40 glass border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <section className="rounded-3xl bg-muted/50 h-40 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 rounded-3xl bg-muted/50 min-h-[380px] animate-pulse" />
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-3xl bg-muted/50 h-32 animate-pulse" />
              <div className="rounded-3xl bg-muted/50 h-48 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state: warm message + Try again
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center space-y-6">
          <span className="text-5xl" aria-hidden>🫙</span>
          <h1 className="text-xl font-semibold text-foreground">Couldn&apos;t load your memories</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => { refetch(); }}
            className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a href="/" className="block text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            Back to Memory Jar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-border pt-[env(safe-area-inset-top,0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[56px] sm:h-16">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/icon.svg" alt="" className="h-8 w-8 shrink-0" aria-hidden />
              <span className="font-semibold text-base sm:text-lg text-foreground truncate">Memory Jar</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 min-w-0 shrink-0">
              {session ? (
                <>
                  <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[200px]" title={session.user?.email ?? undefined}>
                    {session.user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-sm font-medium text-foreground hover:text-accent py-2.5 px-3 min-h-[44px] min-w-[44px] rounded-lg touch-manipulation active:bg-secondary/50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-foreground hover:text-accent py-2.5 px-3 min-h-[44px] flex items-center rounded-lg touch-manipulation active:bg-secondary/50">Log in</Link>
                  <Link href="/register" className="text-sm font-medium bg-accent text-accent-foreground px-4 py-2.5 rounded-xl hover:opacity-90 min-h-[44px] flex items-center touch-manipulation active:opacity-95">Sign up</Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - mobile: tighter padding and spacing for better flow */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10">
        {/* Hero Section: one container – Memory Jar left, Quote right */}
        <section>
          <Hero recentMood={recentMood} />
        </section>

        {/* Main Grid - calendar + sidebar; mobile: stacked with comfortable gap */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
          {/* Calendar - 3 cols; slightly balanced with sidebar */}
          <div ref={calendarRef} className="lg:col-span-3 min-w-0">
            <Calendar memories={memories} onDateClick={handleDateClick} />
          </div>

          {/* Sidebar - constrained to calendar height so it doesn't extend below */}
          <div
            className="lg:col-span-1 min-h-0 flex flex-col"
            style={sidebarMaxHeight != null ? { maxHeight: sidebarMaxHeight } : undefined}
          >
            <div className="overflow-y-auto min-h-0 flex-1 scrollbar-hide">
              <Sidebar
              flashback={flashback}
              onFlashbackClick={handleDateClick}
              memories={memories}
            />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - mobile: less top margin, comfortable padding */}
      <footer className="border-t border-border mt-10 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Made with 💜 for preserving precious moments</p>
            <p className="mt-1">Memory Jar © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      {/* Quick Add: bar (text/emoji) + FAB (full form) */}
      <QuickAddBar onQuickAdd={handleQuickAddNote} disabled={!session} />
      <button
        type="button"
        onClick={openQuickAdd}
        className="fixed right-6 sm:right-8 z-30 w-14 h-14 min-h-[44px] min-w-[44px] rounded-full bg-accent text-accent-foreground shadow-elevated hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background touch-manipulation"
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Open full form for today"
        title="Add memory (full form)"
      >
        <span className="text-2xl" aria-hidden>+</span>
      </button>

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
