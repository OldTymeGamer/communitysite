import { NextRequest, NextResponse } from "next/server"
import { requireOwner } from "@/lib/auth"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const user = await requireOwner(request)
    
    // Only the owner can perform updates for security
    const { updateType = "pull" } = await request.json()
    
    let command = ""
    
    switch (updateType) {
      case "pull":
        // Pull latest changes from git
        command = "git pull origin main && npm install && npm run build"
        break
      case "reset":
        // Reset to latest remote state (dangerous)
        command = "git fetch origin && git reset --hard origin/main && npm install && npm run build"
        break
      default:
        return NextResponse.json({ error: "Invalid update type" }, { status: 400 })
    }
    
    // Execute the update command
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes timeout
    })
    
    return NextResponse.json({
      success: true,
      message: "Website updated successfully",
      output: stdout,
      errors: stderr || null
    })
    
  } catch (error) {
    console.error("Error updating website:", error)
    
    if (error.message === "Authentication required" || error.message === "Owner access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to update website",
      details: error.message 
    }, { status: 500 })
  }
}