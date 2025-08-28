import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { WebsiteSettings } from '@/lib/models/WebsiteSettings'

export async function GET() {
  try {
    await connectDB()
    
    const settings = await WebsiteSettings.findOne()
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        siteName: "Community Website",
        siteDescription: "A multi-game community platform",
        heroTitle: "Welcome to Our Gaming Community",
        heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
        heroBackgroundImage: "",
        galleryImages: [
          { url: "/gallery1.jpg", caption: "", alt: "" },
          { url: "/gallery2.jpg", caption: "", alt: "" },
          { url: "/gallery3.jpg", caption: "", alt: "" },
          { url: "/gallery4.jpg", caption: "", alt: "" }
        ],
        socialLinks: {
          discord: "",
          twitter: "",
          youtube: "",
          twitch: "",
          steam: "",
          facebook: ""
        },
        colors: {
          primary: "#FFC107",
          secondary: "#4FC3F7",
          accent: "#8BC34A",
          background: "#1A1A1A",
          surface: "#2D2D2D",
          text: "#FFFFFF"
        },
        integrations: {
          discord: {
            enabled: false,
            clientId: "",
            clientSecret: "",
            botToken: "",
            guildId: ""
          },
          steam: {
            enabled: false,
            apiKey: ""
          },
          google: {
            enabled: false,
            clientId: "",
            clientSecret: ""
          }
        },
        features: {
          userRegistration: true,
          emailVerification: true,
          serverListing: true,
          communityForum: false,
          eventCalendar: false
        },
        seo: {
          metaTitle: "Community Website",
          metaDescription: "A multi-game community platform",
          keywords: "gaming, community, multiplayer, servers",
          ogImage: ""
        }
      })
    }
    
    // Return public settings (exclude sensitive data)
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      heroTitle: settings.heroTitle,
      heroDescription: settings.heroDescription,
      heroBackgroundImage: settings.heroBackgroundImage,
      galleryImages: settings.galleryImages,
      socialLinks: settings.socialLinks,
      colors: settings.colors,
      assets: settings.assets,
      integrations: settings.integrations,
      features: settings.features,
      seo: settings.seo
    }
    
    return NextResponse.json(publicSettings)
  } catch (error) {
    console.error('Error fetching website settings:', error)
    return NextResponse.json({ error: 'Failed to fetch website settings' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'