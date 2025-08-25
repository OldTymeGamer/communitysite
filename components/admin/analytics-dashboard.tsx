"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Server, MessageSquare, Download, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

import { useEffect, useState } from 'react'
import { Users, TrendingUp } from 'lucide-react'

export function AnalyticsDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [redmStats, setRedmStats] = useState<{ count: number; maxPlayers: number; serverName: string } | null>(null)
  const [redmPlayers, setRedmPlayers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setTotalUsers(data.total))
    fetch('/api/redm/players')
      .then(res => res.json())
      .then(data => setRedmStats(data))
    fetch('/api/redm/playerdata')
      .then(res => res.json())
      .then(data => setRedmPlayers(data))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-green/80 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-sage-green">{totalUsers !== null ? totalUsers : '...'}</p>
              </div>
              <Users className="h-8 w-8 text-electric-blue" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-green/80 text-sm font-medium">RedM Players</p>
                <p className="text-2xl font-bold text-sage-green">
                  {redmStats ? `${redmStats.count} / ${redmStats.maxPlayers}` : '...'}
                </p>
                <p className="text-sage-green/60 text-sm">{redmStats?.serverName || ''}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-gold" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-charcoal-light/80 border-amber-gold/20 mt-6">
        <CardHeader>
          <CardTitle className="text-amber-gold">RedM Synced Players</CardTitle>
          <CardDescription className="text-sage-green/80">Live data from RedM server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sage-green">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Money</th>
                  <th className="px-4 py-2 text-left">Job</th>
                  <th className="px-4 py-2 text-left">Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {redmPlayers.map(player => (
                  <tr key={player.playerId}>
                    <td className="px-4 py-2">{player.username}</td>
                    <td className="px-4 py-2">${player.money}</td>
                    <td className="px-4 py-2">{player.job}</td>
                    <td className="px-4 py-2">{new Date(player.lastSynced).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {redmPlayers.length === 0 && <div className="text-sage-green/60 mt-4">No synced players found.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
