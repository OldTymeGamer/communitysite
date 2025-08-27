import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { newPassword } = await request.json()
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    
    // Find the owner user
    const owner = await User.findOne({ isOwner: true })
    if (!owner) {
      return NextResponse.json({ error: 'No owner found' }, { status: 404 })
    }
    
    console.log('Resetting password for owner:', owner.username)
    
    // Update password (will be hashed by the model's pre-save hook)
    owner.password = newPassword
    await owner.save()
    
    console.log('Password reset successful for owner:', owner.username)
    
    return NextResponse.json({ 
      message: 'Owner password reset successfully',
      username: owner.username,
      email: owner.email
    })
    
  } catch (error) {
    console.error('Owner password reset error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Password reset failed' 
    }, { status: 500 })
  }
}