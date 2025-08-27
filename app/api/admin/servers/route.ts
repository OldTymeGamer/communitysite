import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { GameServer } from "@/lib/models/GameServer"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const servers = await GameServer.find().sort({ createdAt: -1 })
    
    // Update server status for each server
    for (const server of servers) {
      await updateServerStatus(server)
    }
    
    return NextResponse.json(servers)
  } catch (error) {
    console.error("Error fetching servers:", error)
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

    const server = await GameServer.create(data)
    await updateServerStatus(server)
    
    return NextResponse.json(server)
  } catch (error) {
    console.error("Error creating server:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateServerStatus(server: any) {
  try {
    const startTime = Date.now()
    
    // Try to ping the server
    const response = await fetch(`http://${server.ip}:${server.port}/info.json`, {
      method: 'GET',
      timeout: 5000,
    }).catch(() => null)
    
    const ping = Date.now() - startTime
    
    if (response && response.ok) {
      const data = await response.json().catch(() => ({}))
      
      server.isOnline = true
      server.playerCount = data.clients || 0
      server.maxPlayers = data.sv_maxclients || 32
      server.ping = ping
    } else {
      server.isOnline = false
      server.ping = ping > 5000 ? 999 : ping
    }
    
    server.lastChecked = new Date()
    await server.save()
  } catch (error) {
    server.isOnline = false
    server.ping = 999
    server.lastChecked = new Date()
    await server.save()
  }
}