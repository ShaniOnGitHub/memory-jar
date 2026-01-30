import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mb-4">
                        <span className="text-4xl">🫙</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Join Memory Jar</h1>
                    <p className="text-muted-foreground">Start preserving your moments today</p>
                </div>

                {/* Register Card */}
                <div className="glass rounded-3xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

                    <form
                        action={async (formData) => {
                            'use server';
                            const name = formData.get('name') as string;
                            const email = formData.get('email') as string;
                            const password = formData.get('password') as string;

                            if (!email || !password || !name) {
                                throw new Error('All fields are required');
                            }

                            const existingUser = await prisma.user.findUnique({
                                where: { email },
                            });

                            if (existingUser) {
                                throw new Error('User already exists');
                            }

                            const hashedPassword = await bcrypt.hash(password, 10);

                            await prisma.user.create({
                                data: {
                                    name,
                                    email,
                                    password: hashedPassword,
                                },
                            });

                            redirect('/login');
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="name">
                                Name
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="hello@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-mood-happy opacity-60 animate-float" style={{ animationDelay: '0s' }} />
                    <div className="w-3 h-3 rounded-full bg-mood-calm opacity-60 animate-float" style={{ animationDelay: '0.5s' }} />
                    <div className="w-3 h-3 rounded-full bg-mood-excited opacity-60 animate-float" style={{ animationDelay: '1s' }} />
                </div>
            </div>
        </div>
    );
}
