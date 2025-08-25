import dbConnect from '@/lib/db'
import RedMPlayer from '@/lib/models/RedMPlayer'
import { NextResponse } from 'next/server'

export async function GET() {
  await dbConnect()
  const players = await RedMPlayer.find({})
  return NextResponse.json(players)
}

export async function POST(request: Request) {
  await dbConnect()
  const data = await request.json()
  const apiKey = request.headers.get('x-api-key')
  const validKey = process.env.REDM_API_KEY
  if (!apiKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!data.playerId || !data.username) {
    return NextResponse.json({ error: 'Missing playerId or username' }, { status: 400 })
  }
  const updated = await RedMPlayer.findOneAndUpdate(
    { playerId: data.playerId },
    {
      username: data.username,
      money: data.money,
      job: data.job,
      lastSynced: new Date()
    },
    { upsert: true, new: true }
  )
  return NextResponse.json({ success: true, player: updated })
}
