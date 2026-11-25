import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE, missingProductionEnv } from "./lib/constants.ts";
import { SESSION_COOKIE, isValidSession } from "./lib/auth.ts";

// Paths that never require a session: the login page itself and static assets.
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/icons/")
  );
}

export async function middleware(request: NextRequest) {
  // The demo has no password: bypass the gate entirely.
  // DEMO_MODE is always false in production (see lib/constants.ts).
  if (DEMO_MODE) return NextResponse.next();

  // Production misconfiguration: fail closed at request time (never at build).
  if (process.env.NEXT_PHASE !== "phase-production-build" && missingProductionEnv().length > 0) {
    return new NextResponse("Service misconfigured", { status: 503 });
  }

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isValidSession(cookie)) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Skip static assets at the matcher level as well, so the middleware
  // does not run for them at all.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icon|apple-icon|icons/).*)"],
};
