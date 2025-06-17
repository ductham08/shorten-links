import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const PUBLIC_PATHS = ['/login', '/register', '/api/login', '/api/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Check token in cookie
  const token = request.cookies.get('token')?.value

  // No token, redirect to login
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized - Please login to continue' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const payload = await verifyToken(token)
  if (!payload) {
    // Clear invalid token
    const response = request.nextUrl.pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized - Token expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    
    response.cookies.delete('token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 