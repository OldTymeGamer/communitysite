"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, MapPin, Wifi } from "lucide-react"

const servers = [
  {
    id: 1,
    name: "The Lost Trail RP",
    description: "Authentic 1900 roleplay experience with custom jobs, businesses, and storylines.",
    players: 0, // Will be populated from API
    maxPlayers: 48, // Set your actual max players
    location: "US East",
    tags: ["Roleplay", "Whitelist", "Economy"],
    uptime: "99.8%",
    ip: process.env.NEXT_PUBLIC_REDM_SERVER_IP || "173.208.177.138",
    port: process.env.NEXT_PUBLIC_REDM_SERVER_PORT || "30126",
  },
]

// Hook to get user's geolocation for better ping calculation
function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Geolocation error:", error)
          // Fallback to IP-based location
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
              if (data.latitude && data.longitude) {
                setLocation({
                  lat: data.latitude,
                  lon: data.longitude,
                })
              }
            })
            .catch(() => console.log("IP geolocation failed"))
        }
      )
    }
  }, [])

  return location
}

// Enhanced ping measurement with geolocation consideration
function usePing(serverIp: string, serverPort: string, userLocation: { lat: number; lon: number } | null) {
  const [ping, setPing] = useState<number | null>(null)
  const [estimatedPing, setEstimatedPing] = useState<number | null>(null)

  useEffect(() => {
    // Calculate estimated ping based on geolocation
    if (userLocation) {
      // Server location (approximate for US East)
      const serverLat = 39.0458 // Virginia/US East approximate
      const serverLon = -76.6413
      
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lon, 
        serverLat, 
        serverLon
      )
      
      // Rough estimation: ~1ms per 100km + base latency
      const estimated = Math.round(distance / 100 + 20)
      setEstimatedPing(estimated)
    }

    const measurePing = async () => {
      const start = performance.now()
      try {
        // Try to ping the actual server endpoint
        const response = await fetch(`/api/redm/ping?ip=${serverIp}&port=${serverPort}`, { 
          method: "GET", 
          cache: "no-store" 
        })
        const end = performance.now()
        const actualPing = Math.round(end - start)
        setPing(actualPing)
      } catch (e) {
        // If direct ping fails, use estimated ping
        setPing(estimatedPing)
      }
    }

    measurePing()
    const interval = setInterval(measurePing, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [serverIp, serverPort, userLocation, estimatedPing])

  return ping || estimatedPing
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Hook to fetch real-time player data
function useServerData() {
  const [serverData, setServerData] = useState<{
    players: number
    maxPlayers: number
    serverName: string
  } | null>(null)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const response = await fetch('/api/redm/players', { cache: 'no-store' })
        const data = await response.json()
        setServerData({
          players: data.count || 0,
          maxPlayers: data.maxPlayers || 48,
          serverName: data.serverName || "The Lost Trail RP"
        })
      } catch (error) {
        console.error('Failed to fetch server data:', error)
      }
    }

    fetchServerData()
    const interval = setInterval(fetchServerData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return serverData
}

// Helper to style ping
function getPingStatus(ping: number | null) {
  if (ping === null) {
    return { color: "text-gray-400", label: "N/A" }
  }
  if (ping < 50) {
    return { color: "text-green-500", label: `${ping}ms` }
  }
  if (ping < 100) {
    return { color: "text-yellow-500", label: `${ping}ms` }
  }
  return { color: "text-red-500", label: `${ping}ms` }
}

export function FeaturedServers() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const userLocation = useGeolocation()
  const serverData = useServerData()

  const nextServer = () => {
    setCurrentIndex((prev) => (prev + 1) % servers.length)
  }

  const prevServer = () => {
    setCurrentIndex((prev) => (prev - 1 + servers.length) % servers.length)
  }

  const currentServer = servers[currentIndex]
  const ping = usePing(currentServer.ip, currentServer.port, userLocation)
  const { color, label } = getPingStatus(ping)

  // Use real server data if available, otherwise fall back to static data
  const displayData = {
    ...currentServer,
    players: serverData?.players ?? currentServer.players,
    maxPlayers: serverData?.maxPlayers ?? currentServer.maxPlayers,
    name: serverData?.serverName ?? currentServer.name,
  }

  // Set loading to false once we have some data
  useEffect(() => {
    if (serverData !== null || ping !== null) {
      setIsLoading(false)
    }
  }, [serverData, ping])

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-western text-3xl md:text-5xl text-secondary mb-4">Our Server</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular and well-maintained server in our community.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="western-card p-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-foreground">{displayData.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        displayData.players > 0 ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className={`text-sm ${
                        displayData.players > 0 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {displayData.players > 0 ? 'Online' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{displayData.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {displayData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/20 text-secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Join Server
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-primary/20 text-primary hover:bg-primary/10"
                      onClick={async () => {
                        const serverAddress = `${displayData.ip}:${displayData.port}`
                        try {
                          await navigator.clipboard.writeText(serverAddress)
                          setShowCopyToast(true)
                          setTimeout(() => setShowCopyToast(false), 2000)
                        } catch (error) {
                          console.error('Failed to copy to clipboard:', error)
                        }
                      }}
                    >
                      Copy IP
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Players</span>
                    </div>
                    <span className="font-semibold">
                      <span className={displayData.players > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                        {isLoading ? '...' : displayData.players}
                      </span>
                      <span className="text-muted-foreground">/{displayData.maxPlayers}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span>Ping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${color}`}>
                        {isLoading ? '...' : label}
                      </span>
                      {userLocation && !isLoading && (
                        <span className="text-xs text-muted-foreground">
                          (geo-based)
                        </span>
                      )}
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>Location</span>
                    </div>
                    <span className="font-semibold">{displayData.location}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Uptime</span>
                    </div>
                    <span className="font-semibold text-green-400">{displayData.uptime}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
