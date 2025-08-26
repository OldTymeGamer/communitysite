// Create first admin user script
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/community'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function questionHidden(query) {
  return new Promise(resolve => {
    process.stdout.write(query)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    
    let password = ''
    process.stdin.on('data', function(char) {
      char = char + ''
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdout.write('\n')
          resolve(password)
          break
        case '\u0003':
          process.exit()
          break
        default:
          password += char
          process.stdout.write('*')
          break
      }
    })
  })
}

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    
    // Check if any admin users already exist
    const existingAdmin = await usersCollection.findOne({ isAdmin: true })
    if (existingAdmin) {
      console.log('An admin user already exists!')
      console.log('Username:', existingAdmin.username)
      console.log('Email:', existingAdmin.email)
      
      const overwrite = await question('Do you want to create another admin user? (y/N): ')
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Exiting...')
        process.exit(0)
      }
    }
    
    console.log('\n=== Creating Admin User ===')
    
    const username = await question('Enter username: ')
    if (!username || username.length < 3) {
      console.log('Username must be at least 3 characters long')
      process.exit(1)
    }
    
    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      console.log('Username already exists!')
      process.exit(1)
    }
    
    const email = await question('Enter email: ')
    if (!email || !email.includes('@')) {
      console.log('Please enter a valid email address')
      process.exit(1)
    }
    
    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email })
    if (existingEmail) {
      console.log('Email already exists!')
      process.exit(1)
    }
    
    const password = await questionHidden('Enter password (min 6 characters): ')
    if (!password || password.length < 6) {
      console.log('\nPassword must be at least 6 characters long')
      process.exit(1)
    }
    
    const confirmPassword = await questionHidden('Confirm password: ')
    if (password !== confirmPassword) {
      console.log('\nPasswords do not match!')
      process.exit(1)
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create admin user
    const adminUser = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: true,
      isEmailVerified: true,
      isDiscordConnected: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await usersCollection.insertOne(adminUser)
    
    console.log('\n✅ Admin user created successfully!')
    console.log('User ID:', result.insertedId)
    console.log('Username:', username)
    console.log('Email:', email)
    console.log('\nYou can now login to the admin panel with these credentials.')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    rl.close()
    await mongoose.disconnect()
  }
}

createAdmin()