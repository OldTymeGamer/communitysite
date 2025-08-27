import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pull latest changes from git
    await execAsync("git pull origin main")
    
    // Install dependencies
    await execAsync("npm install")
    
    // Build the application
    await execAsync("npm run build")
    
    // Restart the application (this will be handled by PM2 or systemd)
    setTimeout(() => {
      process.exit(0) // This will trigger a restart by the process manager
    }, 1000)

    return NextResponse.json({ message: "Update initiated successfully" })
  } catch (error) {
    console.error("Error updating website:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}