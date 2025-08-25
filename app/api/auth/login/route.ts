import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { username, password } = await request.json()

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      discordId: user.discordId,
      discordUsername: user.discordUsername,
      discordAvatar: user.discordAvatar,
      isDiscordConnected: user.isDiscordConnected,
      createdAt: user.createdAt
    }

    return NextResponse.json(
      { message: 'Login successful', user: userResponse },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}