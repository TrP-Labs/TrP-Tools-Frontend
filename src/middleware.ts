import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const LOCALES = i18n.locales;

function getLocaleFromBrowser(request: NextRequest): string {
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
    parts.splice(1, 1);
  }
  return parts.join('/') || '/';
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const currentLocale = getCurrentLocale(pathname);
  const preferredLanguage = request.cookies.get('preferredLanguage')?.value;

  // CASE 1: URL has a locale already
  if (currentLocale) {
    // If there's no user-set language or it's 'browser', do nothing
    if (!preferredLanguage || preferredLanguage === 'browser') return;

    // If user explicitly set a different language, redirect
    if (preferredLanguage !== currentLocale) {
      const strippedPath = stripLocaleFromPath(pathname);
      const redirectUrl = new URL(
        `/${preferredLanguage}${strippedPath.startsWith('/') ? '' : '/'}${strippedPath}`,
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    return;
  }

  // CASE 2: No locale in the URL
  const targetLocale =
    !preferredLanguage || preferredLanguage === 'browser'
      ? getLocaleFromBrowser(request)
      : preferredLanguage;

  const strippedPath = stripLocaleFromPath(pathname);
  const redirectUrl = new URL(
    `/${targetLocale}${strippedPath.startsWith('/') ? '' : '/'}${strippedPath}`,
    request.url
  );

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
