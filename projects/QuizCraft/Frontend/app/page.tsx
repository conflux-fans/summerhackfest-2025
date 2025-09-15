import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LeaderboardCard } from "@/components/LeaderboardCard"
import { StatsCard } from "@/components/StatsCard"
import { FeatureShowcase } from "@/components/FeatureShowcase"
import { Trophy, Zap, Shield, Gift, Users, Brain, Coins, Star, Sparkles, Target, Crown } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-20">
      <section className="relative text-center py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-secondary/20 animate-gradient" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-montserrat font-black text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
              QuizCraft AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            The world's first <span className="text-accent font-semibold">AI-powered Web3 quiz platform</span> where
            knowledge meets blockchain rewards and real-time competition
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/solo">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-6 font-semibold shadow-2xl hover:shadow-accent/25 transition-all duration-300 animate-pulse-glow"
              >
                <Brain className="mr-3 h-6 w-6" />
                Start Training
              </Button>
            </Link>
            <Link href="/arena">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 py-6 font-semibold glass-effect hover:bg-accent/10 transition-all duration-300 bg-transparent"
              >
                <Trophy className="mr-3 h-6 w-6" />
                Enter Arena
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatsCard icon={Users} label="Active Players" value="12,847" />
            <StatsCard icon={Coins} label="CFX Distributed" value="45,231" />
            <StatsCard icon={Gift} label="NFTs Minted" value="8,492" />
            <StatsCard icon={Zap} label="Quizzes Played" value="156,789" />
          </div>
        </div>
      </section>

      <FeatureShowcase />

      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl md:text-5xl mb-6">
            How <span className="text-accent">QuizCraft AI</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the perfect blend of artificial intelligence, blockchain technology, and competitive gaming
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/50">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-montserrat font-bold">AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our advanced AI analyzes your performance and generates personalized quizzes that adapt to your
                knowledge level and learning style.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Adaptive Difficulty</Badge>
                <Badge variant="secondary">Smart Recommendations</Badge>
                <Badge variant="secondary">Performance Analytics</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-montserrat font-bold">Real-Time Battles</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Join live multiplayer arenas where you compete against players worldwide. Stake CFX tokens and battle
                for the ultimate prize pool.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Live Multiplayer</Badge>
                <Badge variant="secondary">Instant Rewards</Badge>
                <Badge variant="secondary">Global Leaderboards</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-montserrat font-bold">Blockchain Rewards</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Earn CFX tokens and collect unique NFT achievements. Your knowledge becomes valuable digital assets
                stored securely on Conflux blockchain.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">CFX Tokens</Badge>
                <Badge variant="secondary">NFT Badges</Badge>
                <Badge variant="secondary">Secure Ownership</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="font-montserrat font-bold text-4xl md:text-5xl mb-6">
                Why Choose <span className="text-accent">QuizCraft AI</span>?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the next generation of educational gaming with cutting-edge technology and real rewards.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-xl mb-2">Blockchain Security</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All games, rewards, and achievements are secured by smart contracts on the Conflux blockchain,
                    ensuring transparency and fairness.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-xl mb-2">AI-Generated Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Never run out of fresh challenges with our AI that creates unlimited, high-quality questions across
                    diverse topics and difficulty levels.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-xl mb-2">Real Value Rewards</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Win actual CFX tokens and collectible NFTs that have real-world value, making your knowledge truly
                    rewarding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <LeaderboardCard />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-float" />
            <div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-montserrat font-bold text-4xl md:text-5xl mb-6">
            Ready to <span className="text-accent">Revolutionize</span> Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Join thousands of players who are already earning rewards while expanding their knowledge. The future of
            education is here.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/solo">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-12 py-6 font-semibold shadow-2xl hover:shadow-accent/25 transition-all duration-300"
              >
                <Target className="mr-3 h-6 w-6" />
                Start Your Journey
              </Button>
            </Link>
            <Link href="/nft">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-12 py-6 font-semibold glass-effect hover:bg-accent/10 transition-all duration-300 bg-transparent"
              >
                <Star className="mr-3 h-6 w-6" />
                View NFT Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
