import dbConnect from '@/lib/db'
import User from '@/lib/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  await dbConnect()
  const totalUsers = await User.countDocuments()
  return NextResponse.json({ total: totalUsers })
}

export async function DELETE(request: Request) {
  await dbConnect()
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  await User.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
