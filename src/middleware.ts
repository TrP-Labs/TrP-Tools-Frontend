import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const LOCALES = i18n.locales;

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(LOCALES);
  return matchLocale(languages, LOCALES, i18n.defaultLocale);
}

function getCurrentLocale(pathname: string): string | null {
  const parts = pathname.split('/');
  return LOCALES.includes(parts[1]) ? parts[1] : null;
}

function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/');
  if (LOCALES.includes(parts[1])) {
    parts.splice(1, 1); // Remove the locale segment
  }
  return parts.join('/') || '/';
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const currentLocale = getCurrentLocale(pathname);

  const preferredLanguage =
    request.cookies.get('preferredLanguage')?.value || getLocale(request);

  const shouldRedirect =
    !currentLocale || currentLocale !== preferredLanguage;

  if (shouldRedirect) {
    const strippedPath = stripLocaleFromPath(pathname);

    return NextResponse.redirect(
      new URL(`/${preferredLanguage}${strippedPath.startsWith('/') ? '' : '/'}${strippedPath}`, request.url),
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};