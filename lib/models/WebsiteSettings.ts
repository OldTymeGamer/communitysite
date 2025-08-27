import mongoose from "mongoose"

const WebsiteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: "Community Website"
  },
  heroTitle: {
    type: String,
    required: true,
    default: "Welcome to the Wild West"
  },
  heroDescription: {
    type: String,
    required: true,
    default: "Join the ultimate Red Dead Redemption 2 multiplayer community. Experience authentic roleplay, epic adventures, and forge your legend in the frontier."
  },
  galleryImages: [{
    type: String,
    required: true
  }],
  socialLinks: {
    discord: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    twitch: { type: String, default: "" }
  },
  contactEmail: {
    type: String,
    default: ""
  },
  primaryColor: {
    type: String,
    default: "#FFC107"
  },
  secondaryColor: {
    type: String,
    default: "#4FC3F7"
  }
}, {
  timestamps: true
})

export const WebsiteSettings = mongoose.models.WebsiteSettings || mongoose.model("WebsiteSettings", WebsiteSettingsSchema)