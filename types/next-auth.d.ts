import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      profilePicture?: string
      discordId?: string
      discordUsername?: string
      discordAvatar?: string
      isDiscordConnected?: boolean
      isEmailVerified?: boolean
      isAdmin?: boolean
      accessToken?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string
    profilePicture?: string
    discordId?: string
    discordUsername?: string
    discordAvatar?: string
    isDiscordConnected?: boolean
    isEmailVerified?: boolean
    isAdmin?: boolean
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string
    profilePicture?: string
    discordId?: string
    discordUsername?: string
    discordAvatar?: string
    isDiscordConnected?: boolean
    isEmailVerified?: boolean
    isAdmin?: boolean
    accessToken?: string
  }
}
