import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { GameServer } from '@/lib/models/GameServer'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const server = await GameServer.findById(params.id)
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    
    return NextResponse.json(server)
  } catch (error) {
    console.error('Error fetching server:', error)
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const updateData = await request.json()

    // Normalize/validate gameType if present
    if (typeof updateData.gameType === 'string') {
      const allowedTypes = [
        'fivem','redm','minecraft','rust','gmod','csgo','cs2','valorant','apex','cod','battlefield','ark','7dtd','terraria','satisfactory','valheim','palworld','other'
      ]
      const normalizedType = updateData.gameType.toLowerCase()
      updateData.gameType = allowedTypes.includes(normalizedType) ? normalizedType : 'other'
    }

    const server = await GameServer.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      message: 'Server updated successfully',
      server
    })
  } catch (error) {
    console.error('Error updating server:', error)
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin(request)
    await connectDB()
    
    const server = await GameServer.findByIdAndDelete(params.id)
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Server deleted successfully' })
  } catch (error) {
    console.error('Error deleting server:', error)
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }
}