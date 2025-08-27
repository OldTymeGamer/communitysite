import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    const user = verifyToken(token)
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }
  }

  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}