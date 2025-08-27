import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GameServer } from '@/lib/models/GameServer'

export async function GET() {
  try {
    await connectDB()
    
    // Get only public servers that are not in maintenance mode
    const servers = await GameServer.find({
      isPublic: true,
      'adminSettings.maintenanceMode': { $ne: true }
    }).sort({ isFeatured: -1, playerCount: -1, createdAt: -1 })
    
    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching public servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'