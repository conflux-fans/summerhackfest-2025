"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/components/Web3Provider"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, QUIZ_CRAFT_NFT_ABI } from "@/lib/contracts"
import type { NFTMetadata } from "@/types"
import { ImageIcon, Trophy, Award } from "lucide-react"

export default function NFTsPage() {
  const { signer, account, isConnected } = useWeb3()
  const [nfts, setNfts] = useState<NFTMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && account) {
      fetchUserNFTs()
    } else {
      setLoading(false)
    }
  }, [isConnected, account])

  const fetchUserNFTs = async () => {
    if (!signer || !account) return

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.QUIZ_CRAFT_NFT, QUIZ_CRAFT_NFT_ABI, signer)

      // Get user's NFT balance
      const balance = await contract.balanceOf(account)
      const balanceNumber = Number(balance)

      if (balanceNumber === 0) {
        setNfts([])
        setLoading(false)
        return
      }

      // Get all token IDs owned by user
      const tokenIds = []
      for (let i = 0; i < balanceNumber; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i)
        tokenIds.push(tokenId.toString())
      }

      // Fetch metadata for each NFT
      const nftMetadata = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await contract.tokenURI(tokenId)

            // Fetch metadata from IPFS
            const metadataResponse = await fetch(tokenURI)
            const metadata = await metadataResponse.json()

            return {
              tokenId,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
              attributes: metadata.attributes || [],
            }
          } catch (error) {
            console.error(`Error fetching metadata for token ${tokenId}:`, error)
            return {
              tokenId,
              name: `QuizCraft NFT #${tokenId}`,
              description: "Achievement NFT",
              image: "/nft-badge.png",
              attributes: [],
            }
          }
        }),
      )

      setNfts(nftMetadata)
    } catch (error) {
      console.error("Error fetching NFTs:", error)

      // Mock data for demonstration
      const mockNFTs: NFTMetadata[] = [
        {
          tokenId: "1",
          name: "Quiz Master",
          description: "Awarded for achieving a perfect score in Solo Training",
          image: "/golden-trophy-badge.png",
          attributes: [
            { trait_type: "Achievement", value: "Perfect Score" },
            { trait_type: "Rarity", value: "Legendary" },
          ],
        },
        {
          tokenId: "2",
          name: "Arena Champion",
          description: "Won your first Live Arena battle",
          image: "/silver-medal-badge.png",
          attributes: [
            { trait_type: "Achievement", value: "First Victory" },
            { trait_type: "Rarity", value: "Rare" },
          ],
        },
        {
          tokenId: "3",
          name: "Knowledge Seeker",
          description: "Completed 10 quizzes in different categories",
          image: "/bronze-book-badge.png",
          attributes: [
            { trait_type: "Achievement", value: "Category Explorer" },
            { trait_type: "Rarity", value: "Common" },
          ],
        },
      ]

      setNfts(mockNFTs)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "rare":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      case "uncommon":
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600"
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground">Please connect your wallet to view your NFT achievements.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8" />
            Your Achievements
          </h1>
          <p className="text-muted-foreground">Collect NFT badges for your quiz mastery and achievements</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-48 bg-muted rounded"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No NFTs Yet</h3>
              <p className="text-muted-foreground mb-6">Start playing quizzes to earn your first achievement NFTs!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/solo"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Start Solo Training
                </a>
                <a
                  href="/arena"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Join Arena
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => {
              const rarityAttribute = nft.attributes.find((attr) => attr.trait_type.toLowerCase() === "rarity")
              const rarity = rarityAttribute?.value || "Common"

              return (
                <Card key={nft.tokenId} className="overflow-hidden">
                  <div className={`h-2 ${getRarityColor(rarity)}`}></div>
                  <CardHeader className="pb-4">
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/nft-achievement-badge.png"
                        }}
                      />
                    </div>
                    <CardTitle className="text-lg">{nft.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{nft.description}</p>

                    <div className="space-y-2">
                      {nft.attributes.map((attribute, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{attribute.trait_type}:</span>
                          <Badge
                            variant={attribute.trait_type.toLowerCase() === "rarity" ? "default" : "secondary"}
                            className={
                              attribute.trait_type.toLowerCase() === "rarity" ? getRarityColor(attribute.value) : ""
                            }
                          >
                            {attribute.value}
                          </Badge>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Token ID:</span>
                        <span className="text-sm font-mono">#{nft.tokenId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
