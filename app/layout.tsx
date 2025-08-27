import type React from "react"
import type { Metadata } from "next"
import { Inter, Rye } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { FloatingParticles } from "@/components/floating-particles"
import { AuthProvider } from "@/components/session-provider"
import { SetupRedirect } from "@/components/setup-redirect"

const rye = Rye({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-western",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Community Website - Multi-Game Platform",
  description:
    "Join our multi-game community platform. Find servers, connect with players, and build your gaming community.",
  generator: "v0.app",
  keywords: "gaming, community, multiplayer, servers, roleplay, survival",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${rye.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal text-sage-green">
        <AuthProvider>
          <SetupRedirect />
          <FloatingParticles />
          <Navigation />
          <main className="relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
