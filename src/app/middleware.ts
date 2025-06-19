import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/register', '/api/login', '/api/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cho phép các đường dẫn công khai
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Lấy token từ cookie
  const token = request.cookies.get('token')?.value

  // Nếu không có token
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized - Please login to continue' }, { status: 401 })
    }

    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Xác minh token
  const payload = await verifyToken(token)
  if (!payload) {
    const loginUrl = new URL('/login', request.url)
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized - Token expired' }, { status: 401 })
      : NextResponse.redirect(loginUrl)

    // Xóa token bằng cách tạo response mới rồi set lại cookie
    response.headers.set('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly')

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}