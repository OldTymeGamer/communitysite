// Run this script to clean up any problematic Discord user records
// Usage: node scripts/cleanup-discord-users.js

const mongoose = require('mongoose')

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/community'

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    
    // Find users with null email
    const nullEmailUsers = await usersCollection.find({ email: null }).toArray()
    console.log('Users with null email:', nullEmailUsers.length)
    
    // Remove users with null email (these are likely problematic Discord users)
    if (nullEmailUsers.length > 0) {
      const result = await usersCollection.deleteMany({ email: null })
      console.log('Deleted users with null email:', result.deletedCount)
    }
    
    // Find duplicate Discord IDs
    const duplicateDiscordIds = await usersCollection.aggregate([
      { $match: { discordId: { $exists: true, $ne: null } } },
      { $group: { _id: '$discordId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray()
    
    console.log('Duplicate Discord IDs:', duplicateDiscordIds.length)
    
    // Remove duplicate Discord users (keep the first one)
    for (const duplicate of duplicateDiscordIds) {
      const users = await usersCollection.find({ discordId: duplicate._id }).toArray()
      const toDelete = users.slice(1) // Keep first, delete rest
      
      for (const user of toDelete) {
        await usersCollection.deleteOne({ _id: user._id })
        console.log('Deleted duplicate Discord user:', user.username)
      }
    }
    
    console.log('Cleanup completed!')
    
  } catch (error) {
    console.error('Cleanup error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

cleanup()