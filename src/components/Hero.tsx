'use client';

import { useState, useEffect } from 'react';
import type { Mood } from '@/types/memory';

const generalQuotes = [
  { text: 'Collect moments, not things.', author: 'Unknown' },
  { text: 'Every day is a new beginning.', author: 'Unknown' },
  { text: 'The best is yet to come.', author: 'Frank Sinatra' },
  { text: 'Life is made of small moments like this.', author: 'Unknown' },
  { text: "Today is a gift. That's why it's called the present.", author: 'Unknown' },
  { text: 'Memories are timeless treasures of the heart.', author: 'Unknown' },
  { text: 'The purpose of life is to live it.', author: 'Eleanor Roosevelt' },
  { text: 'Make each day your masterpiece.', author: 'John Wooden' },
];

const quotesByMood: Partial<Record<Mood, { text: string; author: string }[]>> = {
  happy: [
    { text: 'Joy is the simplest form of gratitude.', author: 'Karl Barth' },
    { text: 'The best is yet to come.', author: 'Frank Sinatra' },
  ],
  calm: [
    { text: 'Peace is the result of retraining your mind.', author: 'Unknown' },
    { text: 'In the midst of movement and chaos, keep stillness inside.', author: 'Bruce Lee' },
  ],
  excited: [
    { text: 'Enthusiasm is the mother of effort.', author: 'Dale Carnegie' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  ],
  sad: [
    { text: 'There are far better things ahead than any we leave behind.', author: 'C.S. Lewis' },
    { text: "Every day may not be good, but there's something good in every day.", author: 'Unknown' },
  ],
  anxious: [
    { text: "Worry does not empty tomorrow of its sorrow; it empties today of its strength.", author: 'Corrie ten Boom' },
    { text: "Breathe. It's only a bad day, not a bad life.", author: 'Unknown' },
  ],
  neutral: generalQuotes,
};

interface HeroProps {
  recentMood?: Mood | null;
}

const icons = [
  { emoji: '📷', label: 'Capture' },
  { emoji: '✨', label: 'Sparkle' },
  { emoji: '🌸', label: 'Bloom' },
  { emoji: '🎨', label: 'Create' },
  { emoji: '🌀', label: 'Flow' },
  { emoji: '🌿', label: 'Grow' },
];

export function Hero({ recentMood }: HeroProps) {
  const [quote, setQuote] = useState(generalQuotes[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const handleIconClick = (index: number) => {
    setAnimatingIndex(null);
    requestAnimationFrame(() => {
      setAnimatingIndex(index);
    });
    setTimeout(() => setAnimatingIndex(null), 460);
  };

  useEffect(() => {
    const pool =
      recentMood && quotesByMood[recentMood] ? quotesByMood[recentMood]! : generalQuotes;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setQuote(chosen);
    setTimeout(() => setIsVisible(true), 100);
  }, [recentMood]);

  return (
    <section className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F5F0E6] dark:bg-secondary">
      {/* Subtle circular shapes - kept away from quote on mobile */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-8 right-1/4 w-24 h-24 rounded-full bg-primary/30" />
        <div className="absolute bottom-12 right-12 w-16 h-16 rounded-full bg-accent/20 hidden sm:block" />
      </div>

      <div className="relative z-10 p-5 sm:p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-8 md:gap-12 items-stretch">
          {/* Left: Memory Jar title, subtitle, icon grid */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Memory Jar
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your moments, preserved</p>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6 w-full max-w-[220px] sm:max-w-[240px] -rotate-2">
              {icons.map(({ emoji, label }, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleIconClick(index)}
                  className={`min-h-[44px] aspect-square rounded-xl bg-[#FCFBF8] dark:bg-card/95 border border-[rgba(0,0,0,0.06)] dark:border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center text-xl sm:text-2xl cursor-pointer select-none transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:rotate-1 active:scale-[0.98] touch-manipulation ${animatingIndex === index ? 'animate-icon-pop' : ''}`}
                  aria-label={`${label} icon`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quote card - extra top margin on mobile so no overlap with icon grid */}
          <div
            className={`flex-1 min-w-0 flex items-center justify-center transition-all duration-700 mt-4 sm:mt-0 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-md">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-accent/60 mb-3 sm:mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-base sm:text-lg md:text-xl font-normal italic text-foreground/95 mb-2 sm:mb-3 leading-relaxed">
                {quote.text}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground not-italic text-right">— {quote.author}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
