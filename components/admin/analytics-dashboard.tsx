"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Server, MessageSquare, Download, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-electric-blue",
  },
  {
    title: "Active Servers",
    value: "156",
    change: "+3.2%",
    trend: "up",
    icon: Server,
    color: "text-amber-gold",
  },
  {
    title: "Community Posts",
    value: "8,924",
    change: "+18.7%",
    trend: "up",
    icon: MessageSquare,
    color: "text-sage-green",
  },
  {
    title: "Downloads",
    value: "45,231",
    change: "-2.1%",
    trend: "down",
    icon: Download,
    color: "text-rust-red",
  },
]

const serverActivity = [
  { name: "Wild West RP", players: 89, maxPlayers: 100 },
  { name: "Frontier Life", players: 76, maxPlayers: 80 },
  { name: "Outlaw Territory", players: 45, maxPlayers: 60 },
  { name: "Desert Winds", players: 32, maxPlayers: 50 },
  { name: "Gold Rush Valley", players: 28, maxPlayers: 40 },
]

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sage-green/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-sage-green">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="flex items-center mt-4">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-sage-green mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rust-red mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === "up" ? "text-sage-green" : "text-rust-red"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sage-green/60 text-sm ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Server Activity */}
      <Card className="bg-charcoal-light/80 border-amber-gold/20">
        <CardHeader>
          <CardTitle className="text-amber-gold">Server Activity</CardTitle>
          <CardDescription className="text-sage-green/80">Current player counts across active servers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serverActivity.map((server, index) => (
              <motion.div
                key={server.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-charcoal/50 rounded-lg border border-amber-gold/10"
              >
                <div>
                  <h4 className="font-semibold text-sage-green">{server.name}</h4>
                  <p className="text-sage-green/60 text-sm">
                    {server.players}/{server.maxPlayers} players
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={(server.players / server.maxPlayers) * 100} className="h-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
