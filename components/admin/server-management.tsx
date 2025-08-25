"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Settings, Users, Zap } from "lucide-react"
import { motion } from "framer-motion"

const servers = [
  {
    id: 1,
    name: "Wild West RP",
    status: "Online",
    players: 89,
    maxPlayers: 100,
    uptime: "99.8%",
    cpu: 45,
    memory: 67,
    location: "US East",
  },
  {
    id: 2,
    name: "Frontier Life",
    status: "Online",
    players: 76,
    maxPlayers: 80,
    uptime: "98.5%",
    cpu: 62,
    memory: 78,
    location: "US West",
  },
  {
    id: 3,
    name: "Outlaw Territory",
    status: "Maintenance",
    players: 0,
    maxPlayers: 60,
    uptime: "97.2%",
    cpu: 0,
    memory: 12,
    location: "EU Central",
  },
  {
    id: 4,
    name: "Desert Winds",
    status: "Online",
    players: 32,
    maxPlayers: 50,
    uptime: "99.1%",
    cpu: 28,
    memory: 45,
    location: "US Central",
  },
]

export function ServerManagement() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-sage-green text-charcoal"
      case "Maintenance":
        return "bg-amber-gold text-charcoal"
      case "Offline":
        return "bg-rust-red text-white"
      default:
        return "bg-sage-green/50 text-sage-green"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Online":
        return <Zap className="h-4 w-4" />
      case "Maintenance":
        return <Settings className="h-4 w-4" />
      default:
        return <Pause className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <CardTitle className="text-amber-gold">Server Management</CardTitle>
        <CardDescription className="text-sage-green/80">Monitor and control your RedM servers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 bg-charcoal/50 rounded-lg border border-amber-gold/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-sage-green">{server.name}</h3>
                  <Badge className={`${getStatusColor(server.status)} flex items-center gap-1`}>
                    {getStatusIcon(server.status)}
                    {server.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-sage-green/30 text-sage-green hover:bg-sage-green/10 bg-transparent"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rust-red/30 text-rust-red hover:bg-rust-red/10 bg-transparent"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-electric-blue" />
                  <span className="text-sage-green/80 text-sm">
                    {server.players}/{server.maxPlayers} players
                  </span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Uptime: <span className="text-sage-green font-semibold">{server.uptime}</span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Location: <span className="text-sage-green font-semibold">{server.location}</span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Server ID: <span className="text-sage-green font-semibold">#{server.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">Players</span>
                    <span className="text-sage-green">{Math.round((server.players / server.maxPlayers) * 100)}%</span>
                  </div>
                  <Progress value={(server.players / server.maxPlayers) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">CPU Usage</span>
                    <span className="text-sage-green">{server.cpu}%</span>
                  </div>
                  <Progress value={server.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">Memory</span>
                    <span className="text-sage-green">{server.memory}%</span>
                  </div>
                  <Progress value={server.memory} className="h-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
