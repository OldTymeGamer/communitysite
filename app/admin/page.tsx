"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/admin/user-management"
import { ServerManagementNew } from "@/components/admin/server-management-new"
import { ContentModeration } from "@/components/admin/content-moderation"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { WebsiteSettings } from "@/components/admin/website-settings"
import { Users, Server, Shield, BarChart3, Settings, Globe } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-rye text-amber-gold mb-2">Admin Dashboard</h1>
          <p className="text-sage-green/80">Manage your RedM community</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-charcoal-light/50 border border-amber-gold/20">
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="servers"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Server className="h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Shield className="h-4 w-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="website"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Globe className="h-4 w-4" />
              Website
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="servers">
            <ServerManagementNew />
          </TabsContent>

          <TabsContent value="moderation">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold">System Settings</CardTitle>
                <CardDescription className="text-sage-green/80">
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="website">
            <WebsiteSettings />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
