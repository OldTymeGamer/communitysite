"use client"

import type React from "react"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else if (result?.ok) {
        // Redirect to home page or dashboard
        window.location.href = "/"
      }
    } catch (error) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-rye text-amber-gold">Welcome Back</CardTitle>
            <CardDescription className="text-sage-green">Sign in to access your RedM community account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sage-green">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-sage-green/60" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10 bg-charcoal/50 border-amber-gold/30 text-sage-green placeholder:text-sage-green/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sage-green">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-sage-green/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-charcoal/50 border-amber-gold/30 text-sage-green placeholder:text-sage-green/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-sage-green/60 hover:text-sage-green"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-gold/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-charcoal-light text-sage-green/70">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                onClick={() => signIn('discord', { callbackUrl: '/' })}
                className="w-full mt-4 bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                Continue with Discord
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <Link 
                  href="/forgot-password" 
                  className="text-sage-green/70 hover:text-amber-gold transition-colors"
                >
                  Forgot password?
                </Link>
                <Link 
                  href="/resend-verification" 
                  className="text-sage-green/70 hover:text-amber-gold transition-colors"
                >
                  Resend verification
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-sage-green/70">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-amber-gold hover:text-amber-gold/80 font-semibold">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
