"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function SetupRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Don't redirect if already on setup page or API routes
    if (pathname.startsWith('/setup') || pathname.startsWith('/api')) {
      setChecking(false)
      return
    }

    // Check if setup is needed
    const checkSetup = async () => {
      try {
        console.log('Checking if setup is needed...')
        const response = await fetch('/api/setup/initial')
        if (response.ok) {
          const data = await response.json()
          console.log('Setup check result:', data)
          if (data.needsSetup) {
            console.log('Setup needed, redirecting to /setup')
            router.push('/setup')
          } else {
            console.log('Setup not needed, owner exists')
          }
        } else {
          console.error('Setup check failed with status:', response.status)
        }
      } catch (error) {
        console.error('Setup check failed:', error)
      } finally {
        setChecking(false)
      }
    }

    checkSetup()
  }, [pathname, router])

  // Show loading state while checking
  if (checking && !pathname.startsWith('/setup') && !pathname.startsWith('/api')) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50">
        <div className="text-amber-gold">Checking setup status...</div>
      </div>
    )
  }

  return null // This component doesn't render anything
}