import { NextRequest, NextResponse } from 'next/server';
import { verifyBasicAuth, createBasicAuthResponse } from './lib/auth';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    if (!verifyBasicAuth(authHeader)) {
      return createBasicAuthResponse();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};