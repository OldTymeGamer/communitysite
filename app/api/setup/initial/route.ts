import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/lib/models/User"
import { WebsiteSettings } from "@/lib/models/WebsiteSettings"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Check if any users exist
    const existingUsers = await User.countDocuments()
    if (existingUsers > 0) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 400 })
    }

    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the first owner user
    const owner = new User({
      username,
      email,
      password: hashedPassword,
      isOwner: true,
      isAdmin: true,
      isEmailVerified: true, // Auto-verify the owner
    })

    await owner.save()

    // Create default website settings
    const defaultSettings = new WebsiteSettings({
      siteName: "Community Website",
      heroTitle: "Welcome to Our Gaming Community",
      heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
      colors: {
        primary: "#FFC107",
        secondary: "#4FC3F7", 
        accent: "#8BC34A",
        background: "#1A1A1A",
        surface: "#2D2D2D",
        text: "#FFFFFF"
      },
      features: {
        userRegistration: true,
        emailVerification: true,
        serverListing: true,
        communityForum: false,
        eventCalendar: false
      }
    })

    await defaultSettings.save()

    return NextResponse.json({ 
      message: "Initial setup completed successfully",
      user: {
        id: owner._id,
        username: owner.username,
        email: owner.email,
        isOwner: owner.isOwner,
        isAdmin: owner.isAdmin
      }
    })
  } catch (error) {
    console.error("Initial setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    
    // Check if setup is needed
    const userCount = await User.countDocuments()
    
    return NextResponse.json({ 
      setupNeeded: userCount === 0,
      userCount 
    })
  } catch (error) {
    console.error("Setup check error:", error)
    return NextResponse.json({ error: "Setup check failed" }, { status: 500 })
  }
}