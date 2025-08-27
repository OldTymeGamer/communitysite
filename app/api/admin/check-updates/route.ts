import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    
    // Check for updates from GitHub
    const response = await fetch('https://api.github.com/repos/your-username/community-website/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Community-Website'
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        updateAvailable: false,
        error: "Unable to check for updates" 
      })
    }
    
    const latestRelease = await response.json()
    
    // Get current version from package.json
    const packageJson = require('../../../../package.json')
    const currentVersion = packageJson.version
    
    const updateAvailable = latestRelease.tag_name !== `v${currentVersion}`
    
    return NextResponse.json({
      updateAvailable,
      currentVersion,
      latestVersion: latestRelease.tag_name,
      releaseNotes: latestRelease.body,
      releaseUrl: latestRelease.html_url,
      publishedAt: latestRelease.published_at
    })
  } catch (error) {
    console.error("Error checking for updates:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ 
      updateAvailable: false,
      error: "Failed to check for updates" 
    }, { status: 500 })
  }
}