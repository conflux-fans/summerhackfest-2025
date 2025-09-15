import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, Globe, Shield, Award } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "Advanced AI Engine",
    description: "Machine learning algorithms that create personalized quiz experiences",
    badges: ["GPT-4 Powered", "Adaptive Learning", "Smart Analytics"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Global Multiplayer",
    description: "Real-time battles with players from around the world",
    badges: ["Live Matches", "Global Rankings", "Instant Results"],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Transparent and secure gameplay powered by Conflux eSpace",
    badges: ["Smart Contracts", "Decentralized", "Tamper-Proof"],
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Award,
    title: "NFT Achievements",
    description: "Collect unique digital badges and showcase your expertise",
    badges: ["Rare Collectibles", "Proof of Knowledge", "Tradeable Assets"],
    gradient: "from-orange-500 to-red-500",
  },
]

export function FeatureShowcase() {
  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <h2 className="font-montserrat font-bold text-4xl md:text-5xl mb-6">
          Cutting-Edge <span className="text-accent">Features</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Discover the innovative technologies that make QuizCraft AI the most advanced quiz platform ever created
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/50 animate-float"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="relative text-center">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-montserrat font-bold">{feature.title}</CardTitle>
            </CardHeader>

            <CardContent className="relative text-center space-y-4">
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

              <div className="flex flex-wrap gap-1 justify-center">
                {feature.badges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} variant="secondary" className="text-xs px-2 py-1">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
