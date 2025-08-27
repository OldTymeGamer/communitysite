"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function SetupRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect if already on setup page or API routes
    if (pathname.startsWith('/setup') || pathname.startsWith('/api')) {
      return
    }

    // Check if setup is needed
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/setup/initial')
        if (response.ok) {
          const data = await response.json()
          if (data.needsSetup) {
            router.push('/setup')
          }
        }
      } catch (error) {
        console.error('Setup check failed:', error)
      }
    }

    checkSetup()
  }, [pathname, router])

  return null // This component doesn't render anything
}