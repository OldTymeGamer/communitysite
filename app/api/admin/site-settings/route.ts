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
    
    let settings = await db.collection('site_settings').findOne({})
    
    if (!settings) {
      // Create default settings
      const defaultSettings = {
        siteName: 'Community Website',
        heroImages: [
          '/images/hero-1.jpg',
          '/images/hero-2.jpg',
          '/images/hero-3.jpg'
        ],
        heroTitle: 'Welcome to Our Community',
        heroSubtitle: 'Join our amazing gaming community',
        discordInvite: '',
        socialLinks: {
          discord: '',
          twitter: '',
          youtube: '',
          twitch: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await db.collection('site_settings').insertOne(defaultSettings)
      settings = defaultSettings
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
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
    const { db } = await connectToDatabase()
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    
    const result = await db.collection('site_settings').updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}