import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          const user = await User.findOne({
            $or: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            return null
          }

          // Check if email is verified
          if (!user.isEmailVerified) {
            throw new Error('Please verify your email before signing in. Check your inbox for a verification link.')
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            discordId: user.discordId,
            discordUsername: user.discordUsername,
            discordAvatar: user.discordAvatar,
            isDiscordConnected: user.isDiscordConnected,
            isEmailVerified: user.isEmailVerified,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds.members.read",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        try {
          await dbConnect()
          
          // Step 1: Check if Discord ID already exists (existing Discord user)
          let existingDiscordUser = await User.findOne({ discordId: profile?.id })
          if (existingDiscordUser) {
            console.log("Existing Discord user found, logging in:", existingDiscordUser.username)
            return true
          }
          
          // Step 2: Check if email exists (link to existing email account)
          if (profile?.email) {
            let existingEmailUser = await User.findOne({ email: profile.email })
            if (existingEmailUser) {
              // Link Discord to existing email account
              existingEmailUser.discordId = profile.id
              existingEmailUser.discordUsername = profile.username
              existingEmailUser.discordAvatar = profile.image_url || profile.avatar_url
              existingEmailUser.isDiscordConnected = true
              await existingEmailUser.save()
              console.log("Linked Discord to existing email account:", existingEmailUser.username)
              return true
            }
          }
          
          // Step 3: Create new Discord user
          let username = profile?.username || `user_${profile?.id.slice(-6)}`
          
          // Make username unique if needed
          let counter = 1
          let originalUsername = username
          while (await User.findOne({ username })) {
            username = `${originalUsername}_${counter}`
            counter++
          }
          
          const newUser = new User({
            username,
            email: profile?.email, // Can be undefined/null for Discord-only users
            discordId: profile?.id,
            discordUsername: profile?.username,
            discordAvatar: profile?.image_url || profile?.avatar_url,
            isDiscordConnected: true,
            isEmailVerified: profile?.email ? false : true,
            profilePicture: profile?.image_url || profile?.avatar_url,
          })
          
          await newUser.save()
          console.log("New Discord user created:", newUser.username)
          return true
          
        } catch (error) {
          console.error("Discord authentication error:", error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, account, profile, user, trigger }) {
      console.log("JWT: Called with trigger:", trigger, "account:", !!account, "profile:", !!profile, "user:", !!user)
      
      // Handle Discord login (first time only)
      if (account && profile && account.provider === "discord") {
        token.accessToken = account.access_token
        token.discordId = profile.id
        
        // Always fetch fresh user data from database for Discord logins
        try {
          await dbConnect()
          const dbUser = await User.findOne({ discordId: profile.id })
          if (dbUser) {
            // Store MongoDB ID in a custom field since NextAuth will override 'sub' with Discord ID
            token.mongoId = dbUser._id.toString()
            token.id = dbUser._id.toString()
            token.username = dbUser.username
            token.email = dbUser.email
            token.profilePicture = dbUser.profilePicture
            token.discordUsername = dbUser.discordUsername
            token.discordAvatar = dbUser.discordAvatar
            token.isDiscordConnected = dbUser.isDiscordConnected
            token.isEmailVerified = dbUser.isEmailVerified
            console.log("JWT: Discord user data loaded:", {
              username: dbUser.username,
              isDiscordConnected: dbUser.isDiscordConnected,
              discordUsername: dbUser.discordUsername,
              mongoId: token.mongoId
            })
          }
        } catch (error) {
          console.error("Error fetching Discord user from DB:", error)
        }
      }
      
      // Handle regular credential login
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.username = user.username
        token.email = user.email
        token.profilePicture = user.profilePicture
        token.discordId = user.discordId
        token.discordUsername = user.discordUsername
        token.discordAvatar = user.discordAvatar
        token.isDiscordConnected = user.isDiscordConnected
        token.isEmailVerified = user.isEmailVerified
      }
      
      // Ensure custom fields persist on subsequent calls
      if (!account && !user) {
        // This is a subsequent call, make sure our custom fields are preserved
        if (!token.username) {
          try {
            await dbConnect()
            let dbUser = null
            
            // Try to find user by MongoDB ID first, then by Discord ID
            if (token.mongoId) {
              dbUser = await User.findById(token.mongoId)
            } else if (token.discordId || token.sub) {
              // token.sub will be the Discord ID for Discord logins
              const discordId = token.discordId || token.sub
              dbUser = await User.findOne({ discordId: discordId })
              if (dbUser) {
                token.mongoId = dbUser._id.toString()
              }
            }
            
            if (dbUser) {
              token.id = dbUser._id.toString()
              token.username = dbUser.username
              token.email = dbUser.email
              token.profilePicture = dbUser.profilePicture
              token.discordId = dbUser.discordId
              token.discordUsername = dbUser.discordUsername
              token.discordAvatar = dbUser.discordAvatar
              token.isDiscordConnected = dbUser.isDiscordConnected
              token.isEmailVerified = dbUser.isEmailVerified
              console.log("JWT: Restored user data from DB for subsequent call")
            }
          } catch (error) {
            console.error("Error restoring user data:", error)
          }
        }
      }
      
      console.log("JWT: Final token:", {
        id: token.id,
        sub: token.sub,
        mongoId: token.mongoId,
        discordId: token.discordId,
        username: token.username,
        isDiscordConnected: token.isDiscordConnected,
        discordUsername: token.discordUsername
      })
      
      return token
    },
    async session({ session, token }) {
      console.log("SESSION: Received token:", {
        id: token.id,
        sub: token.sub,
        mongoId: token.mongoId,
        discordId: token.discordId,
        username: token.username,
        isDiscordConnected: token.isDiscordConnected,
        discordUsername: token.discordUsername,
        tokenKeys: Object.keys(token)
      })
      
      if (token) {
        // Use mongoId for the session user ID (this is the MongoDB ObjectId)
        session.user.id = token.mongoId || token.id || token.sub
        session.user.username = token.username
        session.user.email = token.email
        session.user.profilePicture = token.profilePicture
        session.user.discordId = token.discordId
        session.user.discordUsername = token.discordUsername
        session.user.discordAvatar = token.discordAvatar
        session.user.accessToken = token.accessToken
        session.user.isDiscordConnected = token.isDiscordConnected
        session.user.isEmailVerified = token.isEmailVerified
        
        console.log("SESSION: Final session data:", {
          id: session.user.id,
          username: session.user.username,
          isDiscordConnected: session.user.isDiscordConnected,
          discordUsername: session.user.discordUsername,
          tokenIsDiscordConnected: token.isDiscordConnected
        })
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }