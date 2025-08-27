import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { WebsiteSettings } from '@/lib/models/WebsiteSettings'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Check if registration is enabled
    const settings = await WebsiteSettings.findOne()
    if (settings && !settings.features?.userRegistration) {
      return NextResponse.json({ error: 'User registration is currently disabled' }, { status: 403 })
    }
    
    const { username, email, password } = await request.json()
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.email === email.toLowerCase() ? 'Email already registered' : 'Username already taken' 
      }, { status: 400 })
    }
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    })
    
    await user.save()
    
    // TODO: Send verification email here when email settings are configured
    
    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}