"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function OwnerResetPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/owner-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('Owner account created/reset successfully!')
      } else {
        setError(data.error || 'Failed to reset owner account')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md bg-charcoal-light/80 border-amber-gold/20">
            <CardContent className="flex flex-col items-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-xl font-bold text-sage-green mb-2">Success!</h2>
              <p className="text-sage-green/80 text-center mb-6">
                Owner account has been created/reset successfully. You can now login with your new credentials.
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="w-12 h-12 text-amber-gold" />
            </div>
            <CardTitle className="text-2xl font-rye text-amber-gold">
              Owner Account Reset
            </CardTitle>
            <CardDescription className="text-sage-green/80">
              Create or reset the site owner account. This will give you full administrative access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-amber-gold/30 bg-amber-gold/10">
              <AlertCircle className="h-4 w-4 text-amber-gold" />
              <AlertDescription className="text-sage-green">
                <strong>Important:</strong> This will create a new owner account or reset an existing one. 
                Only use this if you are the legitimate site owner.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sage-green">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="bg-charcoal border-amber-gold/30 text-sage-green focus:border-amber-gold"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sage-green">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-charcoal border-amber-gold/30 text-sage-green focus:border-amber-gold"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sage-green">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="bg-charcoal border-amber-gold/30 text-sage-green focus:border-amber-gold"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sage-green">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-charcoal border-amber-gold/30 text-sage-green focus:border-amber-gold"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal font-semibold"
              >
                {loading ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Owner Account...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Create/Reset Owner Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sage-green/60 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-amber-gold hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}