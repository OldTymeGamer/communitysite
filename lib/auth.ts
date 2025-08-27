import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface AuthUser {
  id: string
  username: string
  email?: string
  profilePicture?: string
  discordId?: string
  discordUsername?: string
  discordAvatar?: string
  isDiscordConnected: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  isOwner: boolean
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth-token')?.value
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken
    
    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    await dbConnect()
    const user = await User.findById(decoded.id)
    
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      discordAvatar: user.discordAvatar,
      isDiscordConnected: user.isDiscordConnected || false,
      isEmailVerified: user.isEmailVerified || false,
      isAdmin: user.isAdmin || false,
      isOwner: user.isOwner || false
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!user.isAdmin && !user.isOwner) {
    throw new Error('Admin access required')
  }
  return user
}

export async function requireOwner(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!user.isOwner) {
    throw new Error('Owner access required')
  }
  return user
}