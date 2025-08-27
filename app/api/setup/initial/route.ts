import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { WebsiteSettings } from '@/lib/models/WebsiteSettings'
import { generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await connectDB()
    
    // Check if an owner user exists
    const ownerCount = await User.countDocuments({ isOwner: true })
    
    return NextResponse.json({ 
      needsSetup: ownerCount === 0 
    })
  } catch (error) {
    console.error('Setup check failed:', error)
    return NextResponse.json({ error: 'Setup check failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Check if setup is needed
    const ownerCount = await User.countDocuments({ isOwner: true })
    if (ownerCount > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 })
    }

    const { username, email, password, siteName, siteDescription } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Create owner user (password will be hashed by the model's pre-save hook)
    const user = new User({
      username,
      email: email.toLowerCase(),
      password, // Don't hash here - let the model handle it
      isOwner: true,
      isAdmin: true,
      isEmailVerified: true, // Owner is automatically verified
      isDiscordConnected: false
    })

    await user.save()

    // Create initial website settings
    const settings = new WebsiteSettings({
      siteName: siteName || "Community Website",
      siteDescription: siteDescription || "A multi-game community platform",
      heroTitle: "Welcome to Our Gaming Community",
      heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
      heroBackgroundImage: "",
      galleryImages: [
        { url: "/gallery1.jpg", caption: "", alt: "" },
        { url: "/gallery2.jpg", caption: "", alt: "" },
        { url: "/gallery3.jpg", caption: "", alt: "" },
        { url: "/gallery4.jpg", caption: "", alt: "" }
      ],
      socialLinks: {
        discord: "",
        twitter: "",
        youtube: "",
        twitch: "",
        steam: "",
        facebook: ""
      },
      contactEmail: email,
      colors: {
        primary: "#FFC107",
        secondary: "#4FC3F7",
        accent: "#8BC34A",
        background: "#1A1A1A",
        surface: "#2D2D2D",
        text: "#FFFFFF"
      },
      integrations: {
        discord: {
          enabled: false,
          clientId: "",
          clientSecret: "",
          botToken: "",
          guildId: ""
        },
        steam: {
          enabled: false,
          apiKey: ""
        },
        google: {
          enabled: false,
          clientId: "",
          clientSecret: ""
        }
      },
      emailSettings: {
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        fromEmail: email,
        fromName: siteName || "Community Website"
      },
      features: {
        userRegistration: true,
        emailVerification: true,
        serverListing: true,
        communityForum: false,
        eventCalendar: false
      },
      seo: {
        metaTitle: siteName || "Community Website",
        metaDescription: siteDescription || "A multi-game community platform",
        keywords: "gaming, community, multiplayer, servers",
        ogImage: ""
      }
    })

    await settings.save()

    // Generate JWT token and set cookie to auto-login the user
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner
    })

    // Set auth cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({ 
      message: 'Initial setup completed successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOwner: user.isOwner,
        isAdmin: user.isAdmin
      }
    })

  } catch (error) {
    console.error('Initial setup failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Setup failed' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'