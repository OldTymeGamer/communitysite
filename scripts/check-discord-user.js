// Check Discord user in database
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/community'

async function checkDiscordUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    
    // Find Discord user with ID 1072128616651038740
    const discordUser = await usersCollection.findOne({ discordId: '1072128616651038740' })
    
    if (discordUser) {
      console.log('Discord user found:')
      console.log('- ID:', discordUser._id)
      console.log('- Username:', discordUser.username)
      console.log('- Email:', discordUser.email)
      console.log('- Discord ID:', discordUser.discordId)
      console.log('- Discord Username:', discordUser.discordUsername)
      console.log('- Discord Avatar:', discordUser.discordAvatar)
      console.log('- Is Discord Connected:', discordUser.isDiscordConnected)
      console.log('- Is Email Verified:', discordUser.isEmailVerified)
      console.log('- Profile Picture:', discordUser.profilePicture)
    } else {
      console.log('No Discord user found with ID: 1072128616651038740')
      
      // Check if there's a user with username 'oldtymegamer'
      const usernameUser = await usersCollection.findOne({ username: 'oldtymegamer' })
      if (usernameUser) {
        console.log('User with username "oldtymegamer" found:')
        console.log('- ID:', usernameUser._id)
        console.log('- Username:', usernameUser.username)
        console.log('- Email:', usernameUser.email)
        console.log('- Discord ID:', usernameUser.discordId)
        console.log('- Discord Username:', usernameUser.discordUsername)
        console.log('- Is Discord Connected:', usernameUser.isDiscordConnected)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkDiscordUser()