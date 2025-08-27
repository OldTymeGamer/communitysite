import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { username, email, newPassword } = await request.json()
    
    if (!username || !email || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Check if there's already an owner
    const existingOwner = await User.findOne({ isOwner: true })
    
    if (existingOwner) {
      // Reset existing owner
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      existingOwner.username = username
      existingOwner.email = email.toLowerCase()
      existingOwner.password = hashedPassword
      existingOwner.isEmailVerified = true // Owner doesn't need email verification
      
      await existingOwner.save()
      
      return NextResponse.json({ 
        message: 'Owner account reset successfully',
        userId: existingOwner._id 
      })
    } else {
      // Create new owner
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      const owner = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        isOwner: true,
        isAdmin: true, // Owners are also admins
        isEmailVerified: true, // Owner doesn't need email verification
        isDiscordConnected: false
      })
      
      await owner.save()
      
      return NextResponse.json({ 
        message: 'Owner account created successfully',
        userId: owner._id 
      })
    }
  } catch (error: any) {
    console.error('Owner reset error:', error)
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
      }
      if (error.keyPattern?.email) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to create/reset owner account' }, { status: 500 })
  }
}