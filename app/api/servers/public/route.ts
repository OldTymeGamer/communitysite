import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { GameServer } from "@/lib/models/GameServer"

export async function GET() {
  try {
    await connectDB()
    
    // Only return public servers
    const servers = await GameServer.find({ isPublic: true }).sort({ createdAt: -1 })
    
    return NextResponse.json(servers)
  } catch (error) {
    console.error("Error fetching public servers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}