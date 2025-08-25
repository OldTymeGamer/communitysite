import { NextResponse } from 'next/server'

// Mock server data - in a real implementation, this would come from a database
let servers = [
  {
    id: 1,
    name: "Lost Trail RP",
    status: "Online",
    players: 0,
    maxPlayers: 32,
    uptime: "99.8%",
    cpu: 45,
    memory: 67,
    location: "US East",
    ip: process.env.REDM_SERVER_IP || "173.208.177.138",
    port: process.env.REDM_SERVER_PORT || "30126"
  }
]

export async function GET() {
  try {
    // In a real implementation, you would fetch from database
    // For now, we'll get live data from the RedM server
    const serverIp = process.env.REDM_SERVER_IP || "173.208.177.138"
    const serverPort = process.env.REDM_SERVER_PORT || "30126"
    
    // Try to get live server data
    try {
      const response = await fetch(`https://servers-frontend.fivem.net/api/servers/stream/${serverIp}:${serverPort}`, {
        cache: "no-store",
        headers: {
          "User-Agent": "RedM-Community-Hub/1.0",
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data?.Data) {
          servers[0].players = data.Data.clients || 0
          servers[0].maxPlayers = data.Data.sv_maxclients || 32
          servers[0].name = data.Data.hostname || "Lost Trail RP"
          servers[0].status = "Online"
        }
      }
    } catch (error) {
      console.log("Failed to fetch live server data")
      servers[0].status = "Offline"
    }
    
    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }
    
    // Remove server from the list
    const serverIndex = servers.findIndex(server => server.id === id)
    
    if (serverIndex === -1) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    
    const removedServer = servers.splice(serverIndex, 1)[0]
    
    return NextResponse.json({ 
      success: true, 
      message: `Server ${removedServer.name} has been removed from the dashboard` 
    })
  } catch (error) {
    console.error('Error removing server:', error)
    return NextResponse.json({ error: 'Failed to remove server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, ip, port, maxPlayers } = await request.json()
    
    if (!name || !ip || !port) {
      return NextResponse.json({ error: 'Name, IP, and port are required' }, { status: 400 })
    }
    
    const newServer = {
      id: Math.max(...servers.map(s => s.id)) + 1,
      name,
      status: "Offline",
      players: 0,
      maxPlayers: maxPlayers || 32,
      uptime: "0%",
      cpu: 0,
      memory: 0,
      location: "Unknown",
      ip,
      port
    }
    
    servers.push(newServer)
    
    return NextResponse.json({ 
      success: true, 
      server: newServer,
      message: `Server ${name} has been added to the dashboard` 
    })
  } catch (error) {
    console.error('Error adding server:', error)
    return NextResponse.json({ error: 'Failed to add server' }, { status: 500 })
  }
}