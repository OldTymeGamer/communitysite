import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { WebsiteSettings } from "@/lib/models/WebsiteSettings"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    let settings = await WebsiteSettings.findOne()
    if (!settings) {
      // Create default settings if none exist
      settings = await WebsiteSettings.create({
        siteName: "Community Website",
        heroTitle: "Welcome to the Wild West",
        heroDescription: "Join the ultimate Red Dead Redemption 2 multiplayer community. Experience authentic roleplay, epic adventures, and forge your legend in the frontier.",
        galleryImages: ["/gallery1.jpg", "/gallery2.jpg", "/gallery3.jpg", "/gallery4.jpg"],
        socialLinks: {
          discord: "",
          twitter: "",
          youtube: "",
          twitch: ""
        },
        contactEmail: "",
        primaryColor: "#FFC107",
        secondaryColor: "#4FC3F7"
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching website settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await connectDB()

    let settings = await WebsiteSettings.findOne()
    if (settings) {
      Object.assign(settings, data)
      await settings.save()
    } else {
      settings = await WebsiteSettings.create(data)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving website settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}