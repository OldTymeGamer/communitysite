import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      )
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token to user
    user.passwordResetToken = resetToken
    user.passwordResetExpires = resetExpires
    await user.save()

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    const emailContent = generatePasswordResetEmail(user.username, resetUrl)
    
    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}