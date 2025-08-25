import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Try to get session without authOptions first to see what we get
    const session = await getServerSession()
    
    console.log("DEBUG SESSION API: Raw session:", JSON.stringify(session, null, 2))
    
    return NextResponse.json({
      session: session,
      message: "Session data retrieved"
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}