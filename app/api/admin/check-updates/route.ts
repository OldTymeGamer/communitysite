import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current version from package.json
    const packageJson = require("@/package.json")
    const currentVersion = packageJson.version || "1.0.0"

    try {
      // Check for updates from git
      await execAsync("git fetch origin main")
      const { stdout: localCommit } = await execAsync("git rev-parse HEAD")
      const { stdout: remoteCommit } = await execAsync("git rev-parse origin/main")
      
      const hasUpdate = localCommit.trim() !== remoteCommit.trim()
      
      let changelog: string[] = []
      if (hasUpdate) {
        try {
          const { stdout: logOutput } = await execAsync(`git log --oneline ${localCommit.trim()}..${remoteCommit.trim()}`)
          changelog = logOutput.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split(' ')
            return parts.slice(1).join(' ')
          })
        } catch (error) {
          changelog = ["Updates available"]
        }
      }

      return NextResponse.json({
        currentVersion,
        latestVersion: hasUpdate ? "Latest" : currentVersion,
        hasUpdate,
        changelog
      })
    } catch (error) {
      // If git commands fail, assume no updates
      return NextResponse.json({
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        changelog: []
      })
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}