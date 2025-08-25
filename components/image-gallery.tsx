"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const galleryImages = [
  {
    id: 1,
    src: "/wild-west-town-at-sunset-with-cowboys-on-horseback.png",
    alt: "Wild West Town",
    title: "Frontier Settlement",
    description: "Experience authentic Wild West life in our detailed frontier towns",
  },
  {
    id: 2,
    src: "/bank-heist-scene-with-outlaws-and-sheriff.png",
    alt: "Bank Heist",
    title: "High Stakes Heists",
    description: "Plan and execute daring robberies with your gang",
  },
  {
    id: 3,
    src: "/saloon-interior-with-poker-game-and-cowboys.png",
    alt: "Saloon Poker",
    title: "Saloon Life",
    description: "Gamble, drink, and socialize in authentic saloons",
  },
  {
    id: 4,
    src: "/horse-racing-across-desert-landscape.png",
    alt: "Horse Racing",
    title: "Wild Races",
    description: "Compete in thrilling horse races across the frontier",
  },
  {
    id: 5,
    src: "/gunfight-duel-at-high-noon-in-dusty-street.png",
    alt: "Gunfight Duel",
    title: "Showdowns",
    description: "Test your skills in intense gunfight duels",
  },
  {
    id: 6,
    src: "/mining-operation-in-mountains-with-gold-prospector.png",
    alt: "Gold Mining",
    title: "Gold Rush",
    description: "Strike it rich in the dangerous mining territories",
  },
]

export function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openModal = (id: number) => setSelectedImage(id)
  const closeModal = () => setSelectedImage(null)

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return

    const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    } else {
      newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
    }

    setSelectedImage(galleryImages[newIndex].id)
  }

  const selectedImageData = galleryImages.find((img) => img.id === selectedImage)

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">Life on the Frontier</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in the authentic Wild West experience with stunning visuals and endless adventures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => openModal(image.id)}
            >
              <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-card">
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-lg font-bold text-primary mb-1 font-serif">{image.title}</h3>
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                </div>
                <div className="absolute inset-0 border-2 border-accent/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && selectedImageData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-card border-2 border-primary/30 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-primary"
                onClick={closeModal}
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-primary"
                onClick={() => navigateImage("prev")}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background text-primary"
                onClick={() => navigateImage("next")}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              <img
                src={selectedImageData.src || "/placeholder.svg"}
                alt={selectedImageData.alt}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              <div className="p-6 bg-gradient-to-t from-background to-background/50">
                <h3 className="text-2xl font-bold text-primary mb-2 font-serif">{selectedImageData.title}</h3>
                <p className="text-muted-foreground">{selectedImageData.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
