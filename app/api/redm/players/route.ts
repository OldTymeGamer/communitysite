import { NextResponse } from "next/server"

export async function GET() {
  const serverIp = process.env.REDM_SERVER_IP || "localhost"
  const serverPort = process.env.REDM_SERVER_PORT || "30120"
  
  try {
    // Try FiveM/RedM server list API first (most reliable)
    let playerCount = 0
    let maxPlayers = 32
    let serverName = "RedM Server"
    
    try {
      const listResponse = await fetch(`https://servers-frontend.fivem.net/api/servers/stream/${serverIp}:${serverPort}`, {
        cache: "no-store",
        headers: {
          "User-Agent": "RedM-Community-Hub/1.0",
        },
      })
      
      if (listResponse.ok) {
        const listData = await listResponse.json()
        if (listData?.Data) {
          playerCount = listData.Data.clients || 0
          maxPlayers = listData.Data.sv_maxclients || 32
          serverName = listData.Data.hostname || "RedM Server"
        }
      }
    } catch (listError) {
      console.log("Server list API failed, trying direct connection...")
    }
    
    // If server list API failed, try direct connection
    if (playerCount === 0) {
      try {
        const directResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
          cache: "no-store",
          headers: {
            "User-Agent": "RedM-Community-Hub/1.0",
          },
        })
        
        if (directResponse.ok) {
          const playersData = await directResponse.json()
          playerCount = Array.isArray(playersData) ? playersData.length : 0
        }
      } catch (directError) {
        console.log("Direct connection failed")
      }
    }
    
    return NextResponse.json({ 
      count: playerCount,
      maxPlayers: maxPlayers,
      serverName: serverName
    })
    
  } catch (error: any) {
    console.error("Error fetching RedM server info:", error)
    return NextResponse.json({ 
      count: 0,
      maxPlayers: 32,
      serverName: "RedM Server",
      error: error.message 
    }, { status: 500 })
  }
}
