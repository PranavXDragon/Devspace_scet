import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only public routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/events(.*)',
  '/team(.*)',
  '/verify-(.*)',
  '/api/(.*)',
]);

const isStudentRoute = createRouteMatcher([
  '/student(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isStudentRoute(req) && !isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Force direct in-app redirect to prevent mobile browsers hanging on *.accounts.dev
      const signInUrl = new URL('/sign-in', req.url);
      const returnTarget = req.nextUrl.pathname + req.nextUrl.search;
      signInUrl.searchParams.set('redirect_url', returnTarget);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/_clerk(.*)',
    '/__clerk(.*)',
  ],
};