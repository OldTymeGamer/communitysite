import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { GameServer } from '@/lib/models/GameServer'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const servers = await GameServer.find().sort({ createdAt: -1 })
    
    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching servers:', error)
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const serverData = await request.json()
    
    // Validate required fields
    if (!serverData.name || !serverData.ip || !serverData.port) {
      return NextResponse.json({ error: 'Name, IP, and port are required' }, { status: 400 })
    }
    
    // Check if server with same IP:port already exists
    const existingServer = await GameServer.findOne({
      ip: serverData.ip,
      port: serverData.port
    })
    
    if (existingServer) {
      return NextResponse.json({ error: 'Server with this IP and port already exists' }, { status: 400 })
    }
    
    const server = new GameServer({
      ...serverData,
      lastChecked: new Date()
    })
    
    await server.save()
    
    return NextResponse.json({
      message: 'Server created successfully',
      server
    })
  } catch (error) {
    console.error('Error creating server:', error)
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}