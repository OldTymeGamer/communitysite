import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get('ip') || process.env.GAME_SERVER_IP || "173.208.177.138"
  const port = searchParams.get('port') || process.env.GAME_SERVER_PORT || "30126"
  
  try {
    const start = Date.now()
    
    // Try to ping the server using the FiveM/RedM API
    const response = await fetch(`https://servers-frontend.fivem.net/api/servers/stream/${ip}:${port}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Community-Hub/1.0",
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    const end = Date.now()
    const ping = end - start
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ 
        ping,
        status: 'online',
        players: data?.Data?.clients || 0,
        maxPlayers: data?.Data?.sv_maxclients || 32
      })
    } else {
      return NextResponse.json({ 
        ping: null,
        status: 'offline',
        error: 'Server not responding'
      }, { status: 503 })
    }
    
  } catch (error: any) {
    console.error("Error pinging server:", error)
    
    // If the main API fails, try a simple HTTP request to the server
    try {
      const start = Date.now()
      const response = await fetch(`http://${ip}:${port}/info.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000)
      })
      const end = Date.now()
      const ping = end - start
      
      if (response.ok) {
        return NextResponse.json({ 
          ping,
          status: 'online',
          method: 'direct'
        })
      }
    } catch (directError) {
      console.log("Direct ping also failed")
    }
    
    return NextResponse.json({ 
      ping: null,
      status: 'offline',
      error: error.message 
    }, { status: 503 })
  }
}