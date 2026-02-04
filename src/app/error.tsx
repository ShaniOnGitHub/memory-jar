'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-6xl" aria-hidden>🫙</span>
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          Something went wrong — give it another try. If it keeps happening, try refreshing the page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <a
          href="/"
          className="block text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Back to Memory Jar
        </a>
      </div>
    </div>
  );
}
