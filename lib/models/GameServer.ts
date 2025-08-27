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
  apiKey: {
    type: String,
    default: ""
  },
  gameType: {
    type: String,
    enum: ["redm", "fivem", "minecraft", "rust", "gmod", "csgo", "other"],
    default: "other"
  },
  isPublic: {
    type: Boolean,
    default: true
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
  lastChecked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export const GameServer = mongoose.models.GameServer || mongoose.model("GameServer", GameServerSchema)