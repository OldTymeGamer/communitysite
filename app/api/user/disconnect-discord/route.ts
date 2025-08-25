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

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Disconnect Discord
    user.discordId = undefined
    user.discordUsername = undefined
    user.discordAvatar = undefined
    user.isDiscordConnected = false
    
    await user.save()

    return NextResponse.json(
      { message: 'Discord disconnected successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Discord disconnection error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}