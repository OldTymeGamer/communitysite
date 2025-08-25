import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Update password and clear reset token
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    
    await user.save()

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}