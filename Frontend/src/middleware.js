import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that MUST remain public and never redirect to Clerk login wall
const isPublicRoute = createRouteMatcher([
  '/',
  '/student/attendance(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/events(.*)',
  '/team(.*)',
  '/verify-(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && req.nextUrl.pathname.startsWith('/student')) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    });
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