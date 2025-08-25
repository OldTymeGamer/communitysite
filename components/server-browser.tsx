"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ServerDetailModal } from "@/components/server-detail-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, MapPin, Search, Filter, RefreshCw, Play, Star, Shield, Zap } from "lucide-react"

interface Server {
  id: number
  name: string
  description: string
  players: number
  maxPlayers: number
  ping: number
  location: string
  gameMode: string
  tags: string[]
  uptime: string
  version: string
  website?: string
  discord?: string
  featured: boolean
  whitelist: boolean
  lastUpdate: Date
}

const mockServers: Server[] = [
  {
    id: 1,
    name: "Wild West Roleplay",
    description: "Authentic 1899 roleplay experience with custom jobs, businesses, and storylines.",
    players: 64,
    maxPlayers: 64,
    ping: 23,
    location: "US East",
    gameMode: "Roleplay",
    tags: ["Roleplay", "Whitelist", "Economy", "Jobs"],
    uptime: "99.8%",
    version: "1.0.2",
    website: "https://wildwestrp.com",
    discord: "https://discord.gg/wildwest",
    featured: true,
    whitelist: true,
    lastUpdate: new Date(),
  },
  {
    id: 2,
    name: "Frontier Legends",
    description: "Action-packed server with heists, gang wars, and dynamic events.",
    players: 48,
    maxPlayers: 64,
    ping: 45,
    location: "EU West",
    gameMode: "PvP",
    tags: ["PvP", "Events", "Gangs", "Heists"],
    uptime: "98.5%",
    version: "1.0.1",
    featured: true,
    whitelist: false,
    lastUpdate: new Date(),
  },
  {
    id: 3,
    name: "New Austin Chronicles",
    description: "Immersive storytelling with player-driven narratives and custom scripts.",
    players: 32,
    maxPlayers: 48,
    ping: 67,
    location: "US West",
    gameMode: "Story",
    tags: ["Story", "Custom", "Community", "Events"],
    uptime: "97.2%",
    version: "1.0.0",
    featured: false,
    whitelist: true,
    lastUpdate: new Date(),
  },
  {
    id: 4,
    name: "Outlaw Paradise",
    description: "Free-roam server with custom vehicles, weapons, and unlimited possibilities.",
    players: 28,
    maxPlayers: 32,
    ping: 34,
    location: "US Central",
    gameMode: "Freeroam",
    tags: ["Freeroam", "Custom", "Vehicles", "Weapons"],
    uptime: "96.8%",
    version: "0.9.8",
    featured: false,
    whitelist: false,
    lastUpdate: new Date(),
  },
  {
    id: 5,
    name: "Red Dead Reborn",
    description: "Hardcore survival server with permadeath and realistic mechanics.",
    players: 16,
    maxPlayers: 24,
    ping: 89,
    location: "EU East",
    gameMode: "Survival",
    tags: ["Survival", "Hardcore", "Permadeath", "Realistic"],
    uptime: "95.4%",
    version: "1.1.0",
    featured: false,
    whitelist: true,
    lastUpdate: new Date(),
  },
]

export function ServerBrowser() {
  const [servers, setServers] = useState<Server[]>(mockServers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGameMode, setSelectedGameMode] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [showWhitelistOnly, setShowWhitelistOnly] = useState(false)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServers((prev) =>
        prev.map((server) => ({
          ...server,
          players: Math.max(0, server.players + Math.floor(Math.random() * 6) - 3),
          ping: Math.max(10, server.ping + Math.floor(Math.random() * 20) - 10),
          lastUpdate: new Date(),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      const matchesSearch =
        server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesGameMode = selectedGameMode === "all" || server.gameMode === selectedGameMode
      const matchesLocation = selectedLocation === "all" || server.location === selectedLocation
      const matchesWhitelist = !showWhitelistOnly || server.whitelist
      const matchesFeatured = !showFeaturedOnly || server.featured

      return matchesSearch && matchesGameMode && matchesLocation && matchesWhitelist && matchesFeatured
    })
  }, [servers, searchTerm, selectedGameMode, selectedLocation, showWhitelistOnly, showFeaturedOnly])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setServers((prev) =>
      prev.map((server) => ({
        ...server,
        ping: Math.max(10, Math.floor(Math.random() * 100) + 10),
        lastUpdate: new Date(),
      })),
    )
    setIsRefreshing(false)
  }

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-green-400"
    if (ping < 100) return "text-yellow-400"
    return "text-red-400"
  }

  const getPlayerColor = (players: number, maxPlayers: number) => {
    const ratio = players / maxPlayers
    if (ratio < 0.5) return "text-green-400"
    if (ratio < 0.8) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6 western-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedGameMode} onValueChange={setSelectedGameMode}>
            <SelectTrigger>
              <SelectValue placeholder="Game Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Game Modes</SelectItem>
              <SelectItem value="Roleplay">Roleplay</SelectItem>
              <SelectItem value="PvP">PvP</SelectItem>
              <SelectItem value="Story">Story</SelectItem>
              <SelectItem value="Freeroam">Freeroam</SelectItem>
              <SelectItem value="Survival">Survival</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="US East">US East</SelectItem>
              <SelectItem value="US West">US West</SelectItem>
              <SelectItem value="US Central">US Central</SelectItem>
              <SelectItem value="EU West">EU West</SelectItem>
              <SelectItem value="EU East">EU East</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={
              showFeaturedOnly
                ? "bg-secondary text-secondary-foreground"
                : "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            }
          >
            <Star className="w-4 h-4 mr-1" />
            Featured Only
          </Button>
          <Button
            variant={showWhitelistOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowWhitelistOnly(!showWhitelistOnly)}
            className={
              showWhitelistOnly
                ? "bg-secondary text-secondary-foreground"
                : "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            }
          >
            <Shield className="w-4 h-4 mr-1" />
            Whitelist Only
          </Button>
        </div>
      </Card>

      {/* Server List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredServers.length} of {servers.length} servers
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Updates
          </div>
        </div>

        <AnimatePresence>
          {filteredServers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="western-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedServer(server)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Server Info */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{server.name}</h3>
                    {server.featured && (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {server.whitelist && (
                      <Badge variant="outline" className="border-primary text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Whitelist
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{server.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {server.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                        {tag}
                      </Badge>
                    ))}
                    {server.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                        +{server.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      <span className={getPlayerColor(server.players, server.maxPlayers)}>{server.players}</span>/
                      {server.maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className={`text-sm ${getPingColor(server.ping)}`}>{server.ping}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{server.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{server.uptime}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex flex-col gap-2">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle join server
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Join Server
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground w-full bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedServer(server)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredServers.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No servers found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </motion.div>
        )}
      </div>

      {/* Server Detail Modal */}
      <ServerDetailModal server={selectedServer} isOpen={!!selectedServer} onClose={() => setSelectedServer(null)} />
    </div>
  )
}
