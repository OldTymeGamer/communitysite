"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Users, Server, ChevronDown } from "lucide-react"
import { useRef } from "react"

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 20 + 10,
}))

interface WebsiteSettings {
  siteName: string
  heroTitle: string
  heroDescription: string
  galleryImages: string[]
}

const defaultImages = [
  "/gallery1.jpg",
  "/gallery2.jpg",
  "/gallery3.jpg",
  "/gallery4.jpg",
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: "Community Website",
    heroTitle: "Welcome to the Wild West",
    heroDescription: "Join the ultimate Red Dead Redemption 2 multiplayer community. Experience authentic roleplay, epic adventures, and forge your legend in the frontier.",
    galleryImages: defaultImages
  })
  const [shuffledImages, setShuffledImages] = useState<string[]>(defaultImages)
  const [discordCount, setDiscordCount] = useState<number>(0)
  const [gamePlayerCount, setGamePlayerCount] = useState<number>(0)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setMounted(true)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/website-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setShuffledImages(data.galleryImages || defaultImages)
      }
    } catch (error) {
      console.error("Failed to fetch website settings:", error)
    }
  }

  useEffect(() => {
    if (!mounted) return

    // Shuffle images for non-deterministic order each load
    const shuffled = [...heroImages]
      .map((src) => ({ src, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ src }) => src)
    setShuffledImages(shuffled)

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffled.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/discord/members", { cache: "no-store" })
        const data = await res.json()
        if (typeof data?.count === "number") setDiscordCount(data.count)
      } catch {}
    }
    fetchMembers()
    const t = setInterval(fetchMembers, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function fetchGamePlayers() {
      try {
        const res = await fetch("/api/server/players", { cache: "no-store" })
        const data = await res.json()
        if (typeof data?.count === "number") setGamePlayerCount(data.count)
      } catch {}
    }
    fetchGamePlayers()
    const t = setInterval(fetchGamePlayers, 30_000) // Update every 30 seconds
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal">
      <div className="absolute inset-0">
        {shuffledImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${image})`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentImageIndex ? 0.3 : 0,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-transparent to-charcoal opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-transparent to-charcoal/80" />
        {/* Vignette + torn paper-like edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
            maskImage:
              "radial-gradient(ellipse at center, black 60%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,0.7) 82%, rgba(0,0,0,0.4) 88%, rgba(0,0,0,0.2) 92%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 60%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,0.7) 82%, rgba(0,0,0,0.4) 88%, rgba(0,0,0,0.2) 92%, rgba(0,0,0,0) 100%)",
            filter: "contrast(1.05)",
          }}
        />
      </div>

      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-amber-gold/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 via-transparent to-amber-gold/10"
        style={{ y }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ opacity, scale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <TypewriterText
            text={settings.heroTitle}
            className="font-rye text-4xl md:text-7xl lg:text-8xl text-amber-gold mb-6 leading-tight drop-shadow-2xl"
          />
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-sage-green max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {settings.heroDescription}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal px-8 py-4 text-lg font-semibold shadow-2xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Join Now
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-charcoal px-8 py-4 text-lg bg-transparent backdrop-blur-sm shadow-xl"
            >
              <Server className="w-5 h-5 mr-2" />
              Browse Servers
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          <StatCard icon={Users} label="Discord Members" value={discordCount} delay={0} />
          <StatCard icon={Server} label="Online Players" value={gamePlayerCount} delay={0.2} />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <div className="w-8 h-12 border-2 border-amber-gold rounded-full flex justify-center backdrop-blur-sm bg-charcoal-light/30">
          <motion.div
            className="w-1 h-3 bg-amber-gold rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
        <ChevronDown className="w-6 h-6 text-amber-gold mx-auto mt-2" />
      </motion.div>
    </section>
  )
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <h1 className={className}>
      {displayText}
      <motion.span
        className="inline-block w-1 h-[0.8em] bg-electric-blue ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
      />
    </h1>
  )
}

function StatCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: number; delay: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Reset animation whenever the target value changes
  useEffect(() => {
    setHasAnimated(false)
    setCount(0)
  }, [value])

  useEffect(() => {
    if (!hasAnimated && isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          setHasAnimated(true)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value, hasAnimated, isInView])

  return (
    <motion.div
      ref={ref}
      className="bg-charcoal-light/60 backdrop-blur-sm border border-amber-gold/20 rounded-lg p-6 text-center shadow-xl"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        scale: 1.05,
        y: -5,
        boxShadow: "0 20px 40px rgba(255, 193, 7, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
        <Icon className="w-8 h-8 text-amber-gold mx-auto mb-3" />
      </motion.div>
      <div className="text-3xl font-bold text-sage-green mb-2 font-rye">{count.toLocaleString()}</div>
      <div className="text-sage-green/70">{label}</div>
    </motion.div>
  )
}
