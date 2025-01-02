import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { type NextFetchEvent } from 'next/server'

// Private by default, public routes are defined below (regex)
const isPublicRoute = (pathname: string): boolean => {
  const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/api',
    '/', // landing page
    // '/:singleLevel([^/]+)', // single level path
    '/:singleLevel([^/]+)/chat', // course chat pages
  ]
  
  // Check if the path starts with any of the public paths
  return publicPaths.some(path => pathname.startsWith(path))
}

// Create a middleware handler for materials redirect
function materialsRedirectMiddleware(request: NextRequest) {
  const url = request.nextUrl
  const materialsPattern = /^\/([^\/]+)\/materials$/
  const match = url.pathname.match(materialsPattern)

  if (match) {
    const projectName = match[1]
    const newUrl = new URL(`/${projectName}/dashboard`, url)
    return NextResponse.redirect(newUrl)
  }

  return null
}

// Main middleware function
export default async function middleware(request: NextRequest) {
  // Add debugging
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  // First check for materials redirect
  const redirectResponse = materialsRedirectMiddleware(request)
    if (redirectResponse) {
      console.log('Redirecting materials route');
      return redirectResponse;
    }

    // Check if route is public
    if (isPublicRoute(request.nextUrl.pathname)) {
      console.log('Public route detected:', request.nextUrl.pathname);
      return NextResponse.next();
    }

    // Check for authentication token in cookie
    const token = request.cookies.get('oidc.user:' + process.env.NEXT_PUBLIC_KEYCLOAK_URL + '/realms/' + process.env.NEXT_PUBLIC_KEYCLOAK_REALM + ':' + process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
    
    console.log('Auth token found:', !!token);

    // If no token is present, redirect to sign-in
    if (!token) {
      console.log('No token found, redirecting to sign-in');
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(signInUrl);
    }

    console.log('User authenticated, proceeding');
    return NextResponse.next();
}

// Update the matcher configuration
export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)/(.*)',
    '/\\[course_name\\]/gpt4',
    '/:path*/materials',
    '/protected',
  ],
}