'use client';

import { useState, useEffect } from 'react';

const quotes = [
    { text: "Collect moments, not things.", author: "Unknown" },
    { text: "Every day is a new beginning.", author: "Unknown" },
    { text: "The best is yet to come.", author: "Frank Sinatra" },
    { text: "Life is made of small moments like this.", author: "Unknown" },
    { text: "Today is a gift. That's why it's called the present.", author: "Unknown" },
    { text: "Memories are timeless treasures of the heart.", author: "Unknown" },
    { text: "The purpose of life is to live it.", author: "Eleanor Roosevelt" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
];

export function Hero() {
    const [quote, setQuote] = useState(quotes[0]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Pick a random quote on mount
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);

        // Trigger fade-in animation
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-secondary">
            {/* Background Pattern - positioned to not overlap content */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/2 right-8 w-20 h-20 rounded-full bg-mood-happy animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-1/4 w-14 h-14 rounded-full bg-mood-calm animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-8 right-16 w-16 h-16 rounded-full bg-mood-excited animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 right-1/3 w-12 h-12 rounded-full bg-mood-sad animate-float" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
                {/* Title - at the top, clearly visible */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        Memory Jar
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Your moments, preserved</p>
                </div>

                {/* Main Content Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Collage Section */}
                    <div className="flex-shrink-0 grid grid-cols-3 gap-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-card to-muted shadow-md transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <span className="text-2xl opacity-60">
                                    {['📷', '✨', '🌸', '🎨', '💫', '🌿'][i]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Quote Section */}
                    <div
                        className={`flex-1 text-center md:text-right transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <div className="glass rounded-2xl p-6 md:p-8 max-w-lg ml-auto">
                            <svg className="w-8 h-8 text-accent/60 mb-4 mx-auto md:ml-auto md:mr-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <p className="text-xl md:text-2xl font-medium text-foreground mb-3 leading-relaxed">
                                {quote.text}
                            </p>
                            <p className="text-sm text-muted-foreground">— {quote.author}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
