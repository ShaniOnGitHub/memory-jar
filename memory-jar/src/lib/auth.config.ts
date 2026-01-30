import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    session: { strategy: 'jwt' },
    providers: [],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');
            const isOnRegister = nextUrl.pathname.startsWith('/register');

            // Allow login and register pages for everyone
            if (isOnLogin || isOnRegister) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // Protected routes - redirect to login if not logged in
            if (!isLoggedIn) {
                return false;
            }

            return true;
        },
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
