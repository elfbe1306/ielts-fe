import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ROLE_AREA, ROLE_HOME, ROUTES } from "./lib/route";
import type { Role } from "./types/auth-type";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_AREAS = Object.values(ROLE_AREA);

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

function splitLocale(pathname: string) {
    const [, first, ...rest] = pathname.split("/");
    if ((routing.locales as readonly string[]).includes(first)) {
        return { locale: first, path: "/" + rest.join("/") };
    }
    return { locale: routing.defaultLocale, path: pathname };
}

async function readRole(token: string | undefined): Promise<Role | null> {
    if (!token) return null;

    if (!secretKey) {
        console.error("[middleware] JWT_SECRET is not set — treating every request as signed out.");
        return null;
    }

    try {
        const { payload } = await jwtVerify<{ role?: string }>(token, secretKey, {
            issuer: "wit",
            algorithms: ["HS256"],
        });
        const role = payload.role;
        return role && role in ROLE_AREA ? (role as Role) : null;
    } catch {
        return null;
    }
}

function matches(path: string, base: string) {
    return path === base || path.startsWith(base + "/");
}

export default async function middleware(req: NextRequest) {
    const { locale, path } = splitLocale(req.nextUrl.pathname);
    const role = await readRole(req.cookies.get("accessToken")?.value);

    const redirectTo = (target: string) =>
        NextResponse.redirect(new URL(`/${locale}${target}`, req.url));

    // Chưa đăng nhập (hoặc token không hợp lệ) mà vào khu vực cần đăng nhập
    if (!role && PROTECTED_AREAS.some((area) => matches(path, area))) {
        const res = redirectTo(ROUTES.signIn);
        res.cookies.delete("accessToken");
        return res;
    }

    if (role) {
        // Đã đăng nhập mà vào trang đăng nhập
        if (path === ROUTES.landing || matches(path, ROUTES.signIn)) {
            return redirectTo(ROLE_HOME[role]);
        }

        // Vào khu vực của role khác (vd: STUDENT vào /teacher/...)
        const inOtherArea = PROTECTED_AREAS.some(
            (area) => area !== ROLE_AREA[role] && matches(path, area)
        );
        if (inOtherArea) {
            return redirectTo(ROLE_HOME[role]);
        }

        // Vào đúng gốc khu vực của mình (vd: /student) → đưa tới dashboard
        if (path === ROLE_AREA[role]) {
            return redirectTo(ROLE_HOME[role]);
        }
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};