import type React from "react"
import type { Metadata } from "next"
import { Inter, Rye } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { FloatingParticles } from "@/components/floating-particles"
import { AuthProvider } from "@/components/session-provider"

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
  title: "RedM Community Hub - Wild West Multiplayer",
  description:
    "Join the ultimate Red Dead Redemption 2 multiplayer community. Find servers, download mods, and connect with fellow outlaws.",
  generator: "v0.app",
  keywords: "RedM, Red Dead Redemption 2, multiplayer, roleplay, western, community",
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
          <FloatingParticles />
          <Navigation />
          <main className="relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
