import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // If logged in and on login/register, redirect to home
    if (req.auth && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/", req.nextUrl.origin))
    }
    // authorized callback in auth.config.ts redirects unauthenticated users to /login
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
