import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { WebsiteSettings } from "@/lib/models/WebsiteSettings"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get website settings (no auth required for reading)
    let settings = await WebsiteSettings.findOne()
    
    if (!settings) {
      // Create default settings if none exist
      settings = new WebsiteSettings({})
      await settings.save()
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching website settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const updateData = await request.json()
    
    let settings = await WebsiteSettings.findOne()
    
    if (!settings) {
      settings = new WebsiteSettings(updateData)
    } else {
      Object.assign(settings, updateData)
    }
    
    await settings.save()
    
    return NextResponse.json({ 
      message: "Website settings updated successfully",
      settings 
    })
  } catch (error) {
    console.error("Error updating website settings:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}