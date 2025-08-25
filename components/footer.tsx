import Link from "next/link"
import { Github, Twitter, Diamond as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">R</span>
              </div>
              <span className="font-western text-xl text-secondary">RedM Hub</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              The ultimate community hub for Red Dead Redemption 2 multiplayer. Join thousands of outlaws in the most
              immersive western roleplay experience.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Discord className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servers" className="text-muted-foreground hover:text-primary transition-colors">
                  Server Browser
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-muted-foreground hover:text-primary transition-colors">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support/tickets" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Ticket
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2024 RedM Community Hub. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
