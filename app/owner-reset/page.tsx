"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function OwnerResetPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/owner/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`Password reset successful for ${data.username}`)
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Password reset failed")
      }
    } catch (error) {
      toast.error("Password reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-6">
      <div className="max-w-md mx-auto">
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardHeader>
            <CardTitle className="text-amber-gold">Owner Password Reset</CardTitle>
            <p className="text-sage-green/80 text-sm">
              Reset the password for the owner account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sage-green">New Password:</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-charcoal border-amber-gold/30 text-sage-green"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sage-green">Confirm Password:</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-charcoal border-amber-gold/30 text-sage-green"
                minLength={6}
              />
            </div>
            
            <Button 
              onClick={resetPassword} 
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
            >
              {loading ? "Resetting..." : "Reset Owner Password"}
            </Button>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded">
              <p className="text-amber-300 text-sm">
                <strong>Current owner:</strong> osbornjr (bosbornjr@gmail.com)
              </p>
              <p className="text-sage-green/80 text-xs mt-1">
                This will reset the password for the owner account so you can log in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}