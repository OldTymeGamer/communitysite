import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { discordId, discordUsername, discordAvatar } = await request.json()

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()
    
    // Check if Discord account is already connected to another user
    const existingDiscordUser = await User.findOne({ discordId })
    if (existingDiscordUser && existingDiscordUser.email !== session.user.email) {
      return NextResponse.json(
        { error: 'This Discord account is already connected to another user' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Connect Discord
    user.discordId = discordId
    user.discordUsername = discordUsername
    user.discordAvatar = discordAvatar
    user.isDiscordConnected = true
    
    await user.save()

    return NextResponse.json(
      { message: 'Discord connected successfully', user: {
        id: user._id,
        username: user.username,
        email: user.email,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        discordAvatar: user.discordAvatar,
        isDiscordConnected: user.isDiscordConnected,
      }},
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Discord connection error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}