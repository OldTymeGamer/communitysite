import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends mongoose.Document {
  username: string
  email: string
  password: string
  profilePicture?: string
  discordId?: string
  discordUsername?: string
  discordAvatar?: string
  isDiscordConnected: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username must be less than 20 characters long'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: function(this: IUser) {
      // Email is required only if Discord is not connected
      return !this.isDiscordConnected
    },
    unique: true,
    sparse: true, // Allow null values for unique constraint
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: IUser) {
      // Password is required only if Discord is not connected
      return !this.isDiscordConnected
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profilePicture: {
    type: String,
    default: null
  },
  discordId: {
    type: String,
    unique: true,
    sparse: true
  },
  discordUsername: {
    type: String
  },
  discordAvatar: {
    type: String
  },
  isDiscordConnected: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Skip password hashing if no password (Discord users) or password not modified
  if (!this.password || !this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  // Discord users don't have passwords
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent re-compilation during development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)