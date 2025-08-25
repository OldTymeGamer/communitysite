import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    
    if (isAdminRoute && token?.discordId) {
      // Check if user has admin role in Discord
      const adminRoleIds = process.env.DISCORD_ADMIN_ROLE_IDS?.split(",") || []
      
      try {
        const guildId = process.env.DISCORD_GUILD_ID
        const botToken = process.env.DISCORD_BOT_TOKEN
        
        const memberRes = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/${token.discordId}`,
          {
            headers: { Authorization: `Bot ${botToken}` },
          }
        )
        
        if (memberRes.ok) {
          const member = await memberRes.json()
          const hasAdminRole = member.roles?.some((roleId: string) => 
            adminRoleIds.includes(roleId)
          )
          
          if (!hasAdminRole) {
            return NextResponse.redirect(new URL("/", req.url))
          }
        } else {
          return NextResponse.redirect(new URL("/", req.url))
        }
      } catch (error) {
        console.error("Error checking Discord roles:", error)
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}
