import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { GameServer } from "@/lib/models/GameServer"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { isPublic } = await request.json()
    await connectDB()

    const server = await GameServer.findByIdAndUpdate(
      params.id,
      { isPublic },
      { new: true }
    )

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    return NextResponse.json(server)
  } catch (error) {
    console.error("Error updating server visibility:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}