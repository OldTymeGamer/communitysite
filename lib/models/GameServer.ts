import mongoose from "mongoose"

const GameServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  ip: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true,
    default: 30120
  },
  queryPort: {
    type: Number,
    default: null // For games that use different query ports
  },
  gameType: {
    type: String,
    enum: [
      "fivem", "redm", "minecraft", "rust", "gmod", "csgo", "cs2", 
      "valorant", "apex", "cod", "battlefield", "ark", "7dtd", 
      "terraria", "satisfactory", "valheim", "palworld", "other"
    ],
    default: "other"
  },
  gameVersion: {
    type: String,
    default: ""
  },
  connectUrl: {
    type: String,
    default: "" // For games with special connect URLs
  },
  serverImage: {
    type: String,
    default: "" // Server banner/logo
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  playerCount: {
    type: Number,
    default: 0
  },
  maxPlayers: {
    type: Number,
    default: 32
  },
  ping: {
    type: Number,
    default: 0
  },
  uptime: {
    type: Number,
    default: 0 // Percentage
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  // Additional server info that might be retrieved from queries
  serverInfo: {
    map: { type: String, default: "" },
    gameMode: { type: String, default: "" },
    website: { type: String, default: "" },
    discord: { type: String, default: "" },
    rules: [{ type: String }],
    mods: [{ 
      name: { type: String },
      version: { type: String },
      required: { type: Boolean, default: false }
    }]
  },
  // Statistics
  stats: {
    totalConnections: { type: Number, default: 0 },
    peakPlayers: { type: Number, default: 0 },
    averagePlaytime: { type: Number, default: 0 }, // in minutes
    lastPeakDate: { type: Date, default: null }
  },
  // Admin settings
  adminSettings: {
    autoUpdate: { type: Boolean, default: true },
    queryInterval: { type: Number, default: 60 }, // seconds
    alertsEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
})

// Index for better query performance
GameServerSchema.index({ gameType: 1, isPublic: 1, isOnline: 1 })
GameServerSchema.index({ isFeatured: 1, isOnline: 1 })

export const GameServer = mongoose.models.GameServer || mongoose.model("GameServer", GameServerSchema)