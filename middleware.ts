import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles WordPress URL redirects
// You can populate the redirects collection in Firestore later
// For now, we'll use a simple map as an example

const LEGACY_REDIRECTS: Record<string, string> = {
    // Example: '/old-wordpress-url' : 'new-slug'
    // '/2023/01/my-old-post': 'my-old-post',
};

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if this is a legacy WordPress URL
    if (pathname in LEGACY_REDIRECTS) {
        const newSlug = LEGACY_REDIRECTS[pathname];
        const url = request.nextUrl.clone();
        url.pathname = `/blog/${newSlug}`;
        return NextResponse.redirect(url, 301);
    }

    return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
