import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return predefined achievements
    const achievements = [
      {
        id: "1",
        name: "Quiz Master",
        description: "Achieve a perfect score in any quiz",
        icon: "🏆",
        rarity: "legendary",
        unlocked: true
      },
      {
        id: "2", 
        name: "Arena Champion",
        description: "Win your first Live Arena battle",
        icon: "🥇",
        rarity: "epic",
        unlocked: true
      },
      {
        id: "3",
        name: "Knowledge Seeker",
        description: "Complete 10 quizzes in different categories",
        icon: "📚",
        rarity: "rare",
        unlocked: true
      },
      {
        id: "4",
        name: "Speed Demon",
        description: "Answer 5 questions in under 10 seconds",
        icon: "⚡",
        rarity: "rare",
        unlocked: false
      },
      {
        id: "5",
        name: "Accuracy Master",
        description: "Maintain 90%+ accuracy across 10 games",
        icon: "🎯",
        rarity: "epic",
        unlocked: false
      },
      {
        id: "6",
        name: "Streak Master",
        description: "Win 5 games in a row",
        icon: "🔥",
        rarity: "legendary",
        unlocked: false
      },
      {
        id: "7",
        name: "Category Explorer",
        description: "Play quizzes in all available categories",
        icon: "🗺️",
        rarity: "rare",
        unlocked: false
      },
      {
        id: "8",
        name: "Time Warrior",
        description: "Answer all questions with time remaining",
        icon: "⏰",
        rarity: "epic",
        unlocked: false
      },
      {
        id: "9",
        name: "Social Butterfly",
        description: "Play in 10 different lobbies",
        icon: "👥",
        rarity: "rare",
        unlocked: false
      },
      {
        id: "10",
        name: "Point Collector",
        description: "Accumulate 10,000 total points",
        icon: "💰",
        rarity: "epic",
        unlocked: false
      }
    ]

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
