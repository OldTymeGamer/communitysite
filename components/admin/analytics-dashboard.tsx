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

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setTotalUsers(data.total))
    fetch('/api/redm/players')
      .then(res => res.json())
      .then(data => setRedmStats(data))
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
    </div>
  )
}
