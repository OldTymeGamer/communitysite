import mongoose from "mongoose"

const WebsiteSettingsSchema = new mongoose.Schema({
  // Basic Site Information
  siteName: {
    type: String,
    required: true,
    default: "Community Website"
  },
  siteDescription: {
    type: String,
    default: "A multi-game community platform"
  },
  
  // Hero Section
  heroTitle: {
    type: String,
    required: true,
    default: "Welcome to Our Gaming Community"
  },
  heroDescription: {
    type: String,
    required: true,
    default: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms."
  },
  heroBackgroundImage: {
    type: String,
    default: ""
  },
  
  // Gallery
  galleryImages: [{
    url: { type: String, required: true },
    caption: { type: String, default: "" },
    alt: { type: String, default: "" }
  }],
  
  // Social Links
  socialLinks: {
    discord: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    twitch: { type: String, default: "" },
    steam: { type: String, default: "" },
    facebook: { type: String, default: "" }
  },
  
  // Contact Information
  contactEmail: {
    type: String,
    default: ""
  },
  
  // Theme Colors
  colors: {
    primary: { type: String, default: "#FFC107" },
    secondary: { type: String, default: "#4FC3F7" },
    accent: { type: String, default: "#8BC34A" },
    background: { type: String, default: "#1A1A1A" },
    surface: { type: String, default: "#2D2D2D" },
    text: { type: String, default: "#FFFFFF" },
    featuredServerCard: { type: String, default: "#3a3a3c" }
  },

  // Branding / Assets
  assets: {
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" }
  },
  
  // Integration Settings
  integrations: {
    discord: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: "" },
      clientSecret: { type: String, default: "" },
      botToken: { type: String, default: "" },
      guildId: { type: String, default: "" }
    },
    steam: {
      enabled: { type: Boolean, default: false },
      apiKey: { type: String, default: "" }
    },
    google: {
      enabled: { type: Boolean, default: false },
      clientId: { type: String, default: "" },
      clientSecret: { type: String, default: "" }
    }
  },
  
  // Email Settings
  emailSettings: {
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPassword: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    fromName: { type: String, default: "" }
  },
  
  // Features
  features: {
    userRegistration: { type: Boolean, default: true },
    emailVerification: { type: Boolean, default: true },
    serverListing: { type: Boolean, default: true },
    communityForum: { type: Boolean, default: false },
    eventCalendar: { type: Boolean, default: false }
  },
  
  // SEO
  seo: {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogImage: { type: String, default: "" }
  }
}, {
  timestamps: true
})

export const WebsiteSettings = mongoose.models.WebsiteSettings || mongoose.model("WebsiteSettings", WebsiteSettingsSchema)