import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { sendEmail, generateVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { username, email, password } = await request.json()

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Check if this is the first user (should become owner)
    const userCount = await User.countDocuments()
    const isFirstUser = userCount === 0

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user
    const user = new User({
      username,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isOwner: isFirstUser,
      isAdmin: isFirstUser,
      isEmailVerified: isFirstUser // First user is auto-verified
    })

    await user.save()

    // Send verification email (skip for first user as they're auto-verified)
    let emailResult = { success: true }
    if (!isFirstUser) {
      const verificationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
      const emailContent = generateVerificationEmail(username, verificationUrl)
      
      emailResult = await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html
      })

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        // Don't fail registration if email fails, just log it
      }
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isDiscordConnected: user.isDiscordConnected,
      createdAt: user.createdAt
    }

    const message = isFirstUser 
      ? 'Registration successful! You are now the site owner and can access the admin panel.'
      : 'Registration successful! Please check your email to verify your account.'

    return NextResponse.json(
      { 
        message,
        user: userResponse,
        emailSent: emailResult.success,
        isOwner: isFirstUser
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}