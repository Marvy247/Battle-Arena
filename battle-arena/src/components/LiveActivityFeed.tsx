'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'
import { sdsClient } from '../lib/somnia'
import { keccak256, toHex } from 'viem'

interface ActivityItem {
  id: string
  type: 'score' | 'nft' | 'achievement'
  player: string
  score?: number
  tokenId?: number
  timestamp: number
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [totalScores, setTotalScores] = useState(0)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const subscribeToActivity = async () => {
      try {
        const scoreSubmittedTopic = keccak256(toHex('ScoreSubmitted(address,uint256,uint256,uint256)'))
        
        const subscription = await sdsClient.subscribe({
          eventContractSources: [CONTRACT_ADDRESS],
          topicOverrides: [scoreSubmittedTopic],
          ethCalls: [],
          onData: (data) => {
            if (data && Array.isArray(data) && data.length > 0) {
              const eventData = data[0]
              const activity: ActivityItem = {
                id: `${Date.now()}-${Math.random()}`,
                type: 'score',
                player: eventData.player || 'Unknown',
                score: Number(eventData.score || 0),
                tokenId: Number(eventData.tokenId || 0),
                timestamp: Date.now()
              }
              
              setActivities(prev => [activity, ...prev].slice(0, 10)) // Keep last 10
              setTotalScores(prev => prev + 1)
            }
            setIsLive(true)
          },
          onError: (error) => {
            console.error('Activity feed SDS error:', error)
            setIsLive(false)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to activity feed:', error)
        setIsLive(false)
      }
    }

    const unsubscribe = subscribeToActivity()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [])

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            Live Activity Feed
            {isLive ? (
              <Badge variant="default" className="text-xs bg-green-600 animate-pulse">● Live</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">○ Offline</Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">{totalScores} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎮</span>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.player.slice(0, 6)}...{activity.player.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Scored <strong className="text-blue-600">{activity.score}</strong> points
                        {activity.tokenId && activity.tokenId > 0 && (
                          <span className="ml-1">• NFT #{activity.tokenId}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Waiting for live score submissions...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
