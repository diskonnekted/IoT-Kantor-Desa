import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next();
  
  // Allow specific origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://monitor.pondokrejo.id',
    'http://monitor.pondokrejo.id',
    'https://www.monitor.pondokrejo.id',
    'http://www.monitor.pondokrejo.id'
  ];
  
  const origin = request.headers.get('origin');
  
  if (allowedOrigins.includes(origin || '')) {
    response.headers.set('Access-Control-Allow-Origin', origin || '');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/_next/static/:path*',
    '/_next/image/:path*'
  ],
};