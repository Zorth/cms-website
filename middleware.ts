import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['nl', 'en'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If it's missing a locale, redirect to /nl/pathname
  // But exclude /api, /_next, /images, /uploads, /admin, /event, favicon.ico, sitemap.xml, etc.
  if (
    pathnameIsMissingLocale &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/images') &&
    !pathname.startsWith('/uploads') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/event') &&
    !pathname.startsWith('/sitemap.xml') &&
    !pathname.startsWith('/robots.txt') &&
    !pathname.includes('.')
  ) {
    const url = new URL(`/nl${pathname}`, request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|images|uploads|admin|event|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
