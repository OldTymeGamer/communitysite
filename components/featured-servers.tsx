"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"

const servers = [
  {
    id: 1,
    name: "Wild West Roleplay",
    description: "Authentic 1899 roleplay experience with custom jobs, businesses, and storylines.",
    players: 64,
    maxPlayers: 64,
    ping: 23,
    location: "US East",
    tags: ["Roleplay", "Whitelist", "Economy"],
    uptime: "99.8%",
  },
  {
    id: 2,
    name: "Frontier Legends",
    description: "Action-packed server with heists, gang wars, and dynamic events.",
    players: 48,
    maxPlayers: 64,
    ping: 45,
    location: "EU West",
    tags: ["PvP", "Events", "Gangs"],
    uptime: "98.5%",
  },
  {
    id: 3,
    name: "New Austin Chronicles",
    description: "Immersive storytelling with player-driven narratives and custom scripts.",
    players: 32,
    maxPlayers: 48,
    ping: 67,
    location: "US West",
    tags: ["Story", "Custom", "Community"],
    uptime: "97.2%",
  },
]

export function FeaturedServers() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextServer = () => {
    setCurrentIndex((prev) => (prev + 1) % servers.length)
  }

  const prevServer = () => {
    setCurrentIndex((prev) => (prev - 1 + servers.length) % servers.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-western text-3xl md:text-5xl text-secondary mb-4">Featured Servers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular and well-maintained servers in our community
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="western-card p-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-foreground">{servers[currentIndex].name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{servers[currentIndex].description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {servers[currentIndex].tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/20 text-secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Join Server</Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Players</span>
                    </div>
                    <span className="font-semibold">
                      {servers[currentIndex].players}/{servers[currentIndex].maxPlayers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Ping</span>
                    </div>
                    <span className="font-semibold">{servers[currentIndex].ping}ms</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>Location</span>
                    </div>
                    <span className="font-semibold">{servers[currentIndex].location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
            onClick={prevServer}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
            onClick={nextServer}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {servers.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-secondary" : "bg-muted"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
