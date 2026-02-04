import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { AuthError, CredentialsSignin } from 'next-auth';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const session = await auth();
    const { error } = await searchParams;

    // If already logged in, redirect to home
    if (session?.user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mb-4">
                        <span className="text-4xl">🫙</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Memory Jar</h1>
                    <p className="text-muted-foreground">Your moments, preserved</p>
                </div>

                {/* Login Card */}
                <div className="glass rounded-3xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold text-center mb-6">Welcome Back</h2>

                    {error === 'InvalidCredentials' && (
                        <p className="mb-4 text-sm text-red-600 dark:text-red-400 text-center">
                            Invalid email or password. Please try again.
                        </p>
                    )}

                    <form
                        action={async (formData) => {
                            'use server';
                            try {
                                await signIn('credentials', {
                                    email: formData.get('email') as string,
                                    password: formData.get('password') as string,
                                    redirectTo: '/',
                                });
                            } catch (error) {
                                const err = error as Error & { type?: string };
                                const isCredsError =
                                    error instanceof CredentialsSignin ||
                                    (error instanceof AuthError && err.type === 'CredentialsSignin') ||
                                    (err?.message?.includes?.('CredentialsSignin') || err?.name === 'CredentialsSignin');
                                if (isCredsError) {
                                    redirect('/login?error=InvalidCredentials');
                                }
                                throw error;
                            }
                        }}
                        className="space-y-4"
                    >
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
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
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
