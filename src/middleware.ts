import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const LOCALES = ['en', 'ru'];

import { i18n } from "../i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/');
  if (LOCALES.includes(parts[1])) {
    parts.splice(1, 1); // remove locale
  }
  return parts.join('/') || '/';
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  const preferredLanguage = request.cookies.get('preferredLanguage')?.value || null

  console.log(pathnameIsMissingLocale, preferredLanguage)
  
  if (pathnameIsMissingLocale || (preferredLanguage && !pathname.startsWith(`/${preferredLanguage}/`))) {
    const locale = preferredLanguage || getLocale(request);
    const strippedPath = stripLocaleFromPath(pathname);
  
    return NextResponse.redirect(
      new URL(`/${locale}${strippedPath.startsWith('/') ? '' : '/'}${strippedPath}`, request.url),
    );
  }
}

export const config = {
  // Matcher ignoring non page paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
