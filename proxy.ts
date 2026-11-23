import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { PUBLIC_PATHS, ROUTES } from "./lib/route";

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

function splitLocale(pathname: string) {
    const [, first, ...rest] = pathname.split("/");
    if ((routing.locales as readonly string[]).includes(first)) {
        return { locale: first, path: "/" + rest.join("/") };
    }
    return { locale: routing.defaultLocale, path: pathname };
}

async function isSignedIn(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    if (!secretKey) {
        console.error("[middleware] JWT_SECRET is not set — treating every request as signed out.");
        return false;
    }

    try {
        await jwtVerify(token, secretKey, { issuer: "wit", algorithms: ["HS256"] });
        return true;
    } catch {
        return false;
    }
}

export default async function middleware(req: NextRequest) {
    const { locale, path } = splitLocale(req.nextUrl.pathname);
    const signedIn = await isSignedIn(req.cookies.get("accessToken")?.value);
    const isPublic = PUBLIC_PATHS.includes(path);

    const redirectTo = (target: string) =>
        NextResponse.redirect(new URL(`/${locale}${target}`, req.url));

    // Signed out (or invalid token) on a page that needs sign-in -> sign-in
    if (!signedIn && !isPublic) {
        const res = redirectTo(ROUTES.signIn);
        res.cookies.delete("accessToken");
        return res;
    }

    // Already signed in but on the landing or sign-in page -> dashboard
    if (signedIn && isPublic) {
        return redirectTo(ROUTES.dashboard);
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};