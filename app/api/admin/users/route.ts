import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all users with basic info
    const users = await User.find({}, {
      username: 1,
      email: 1,
      discordId: 1,
      discordUsername: 1,
      isDiscordConnected: 1,
      isEmailVerified: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect()
    
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // Delete the user from database
    const deletedUser = await User.findByIdAndDelete(id)
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${deletedUser.username} has been permanently deleted` 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}