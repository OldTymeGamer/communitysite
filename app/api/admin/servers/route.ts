import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const servers = await db.collection('game_servers').find({}).toArray()

    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()
    
    const serverData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
    
    const result = await db.collection('game_servers').insertOne(serverData)

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating server:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { _id, ...updateData } = body
    const { db } = await connectToDatabase()
    
    const result = await db.collection('game_servers').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error updating server:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection('game_servers').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error deleting server:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}