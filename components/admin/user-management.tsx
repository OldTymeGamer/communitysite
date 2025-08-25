"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Shield, Crown } from "lucide-react"
import { motion } from "framer-motion"

const users = [
  {
    id: 1,
    username: "CowboyJoe",
    email: "joe@example.com",
    role: "Admin",
    status: "Active",
    joinDate: "2024-01-15",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    username: "DesertRose",
    email: "rose@example.com",
    role: "Moderator",
    status: "Active",
    joinDate: "2024-02-03",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    username: "OutlawMike",
    email: "mike@example.com",
    role: "User",
    status: "Banned",
    joinDate: "2024-01-28",
    lastActive: "1 week ago",
  },
  {
    id: 4,
    username: "SheriffSarah",
    email: "sarah@example.com",
    role: "Moderator",
    status: "Active",
    joinDate: "2024-01-10",
    lastActive: "30 minutes ago",
  },
  {
    id: 5,
    username: "GoldRushGary",
    email: "gary@example.com",
    role: "User",
    status: "Active",
    joinDate: "2024-03-01",
    lastActive: "5 hours ago",
  },
]

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4" />
      case "Moderator":
        return <Shield className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-amber-gold text-charcoal"
      case "Moderator":
        return "bg-electric-blue text-charcoal"
      default:
        return "bg-sage-green text-charcoal"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-sage-green text-charcoal"
      case "Banned":
        return "bg-rust-red text-white"
      default:
        return "bg-sage-green/50 text-sage-green"
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <CardTitle className="text-amber-gold">User Management</CardTitle>
        <CardDescription className="text-sage-green/80">Manage community members and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-green/60" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-charcoal/50 border-amber-gold/30 text-sage-green"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-charcoal/50 rounded-lg border border-amber-gold/10"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-gold to-amber-gold/60 rounded-full flex items-center justify-center">
                  <span className="text-charcoal font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sage-green">{user.username}</h4>
                    {getRoleIcon(user.role)}
                  </div>
                  <p className="text-sage-green/60 text-sm">{user.email}</p>
                  <p className="text-sage-green/40 text-xs">
                    Joined {user.joinDate} • Last active {user.lastActive}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sage-green/60 hover:text-sage-green hover:bg-amber-gold/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
