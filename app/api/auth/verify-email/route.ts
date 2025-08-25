import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Verify the user
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    
    await user.save()

    return NextResponse.json(
      { message: 'Email verified successfully! You can now log in.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Verify the user
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    
    await user.save()

    return NextResponse.json(
      { message: 'Email verified successfully! You can now log in.', username: user.username },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}