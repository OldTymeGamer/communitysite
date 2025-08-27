import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any
      if (!user || (!user.isAdmin && !user.isOwner)) {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }
  }

  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any
      if (!user || (!user.isAdmin && !user.isOwner)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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