import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/components/Web3Provider"
import { Navbar } from "@/components/Navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "QuizCraft AI - Revolutionary Web3 Quiz Platform",
  description:
    "Experience the future of quizzing with AI-powered questions, blockchain rewards, and real-time multiplayer battles on Conflux eSpace",
  keywords: ["Web3", "Quiz", "AI", "Blockchain", "Conflux", "NFT", "Gaming", "Education"],
  openGraph: {
    title: "QuizCraft AI - Revolutionary Web3 Quiz Platform",
    description:
      "Experience the future of quizzing with AI-powered questions, blockchain rewards, and real-time multiplayer battles",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Web3Provider>
            <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
              <Navbar />
              <main className="relative z-10">{children}</main>
              <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
                <div
                  className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute top-3/4 left-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float"
                  style={{ animationDelay: "2s" }}
                />
              </div>
            </div>
            <Toaster />
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
