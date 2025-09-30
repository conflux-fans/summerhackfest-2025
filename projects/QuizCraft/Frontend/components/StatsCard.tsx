import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
}

export function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
  return (
    <Card className="text-center group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/30">
      <CardContent className="pt-6">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="font-montserrat font-bold text-2xl md:text-3xl text-accent mb-1">{value}</div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </CardContent>
    </Card>
  )
}
