'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'
import { sdsClient } from '../lib/somnia'
import { keccak256, toHex } from 'viem'

interface AchievementsProps {
  achievements: { [key: string]: boolean }
}

export default function Achievements({ achievements }: AchievementsProps) {
  const [globalStats, setGlobalStats] = useState({
    totalPlayers: 0,
    totalScores: 0,
    highestScore: 0,
    totalNFTsMinted: 0
  })
  const [isLive, setIsLive] = useState(false)
  
  const achievementList = [
    { key: 'firstKill', name: 'First Blood', description: 'Destroy your first enemy', icon: '🎯' },
    { key: 'combo10', name: 'Combo Master', description: 'Achieve a 10x combo', icon: '🔥' },
    { key: 'level5', name: 'Survivor', description: 'Reach level 5', icon: '💪' },
    { key: 'score1000', name: 'High Scorer', description: 'Score 1000 points', icon: '⭐' },
    { key: 'asteroid100', name: 'Asteroid Crusher', description: 'Destroy 100 asteroids', icon: '💥' },
  ]

  // Initialize SDS for real-time global stats
  useEffect(() => {
    const subscribeToStats = async () => {
      try {
        const scoreSubmittedTopic = keccak256(toHex('ScoreSubmitted(address,uint256,uint256,uint256)'))
        
        const subscription = await sdsClient.subscribe({
          eventContractSources: [CONTRACT_ADDRESS],
          topicOverrides: [scoreSubmittedTopic],
          ethCalls: [],
          onData: (data) => {
            if (data && Array.isArray(data) && data.length > 0) {
              const eventData = data[0]
              const score = Number(eventData.score || 0)
              
              setGlobalStats(prev => ({
                totalPlayers: prev.totalPlayers + 1,
                totalScores: prev.totalScores + 1,
                highestScore: Math.max(prev.highestScore, score),
                totalNFTsMinted: prev.totalNFTsMinted + 1
              }))
            }
            setIsLive(true)
          },
          onError: (error) => {
            console.error('SDS stats subscription error:', error)
            setIsLive(false)
          },
          onlyPushChanges: true
        })

        setIsLive(true)
        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to stats SDS:', error)
        setIsLive(false)
      }
    }

    const unsubscribe = subscribeToStats()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            Achievements
            {isLive ? (
              <Badge variant="default" className="text-xs bg-green-600">● Live Stats</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">○ Offline</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{globalStats.totalScores}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Scores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{globalStats.totalNFTsMinted}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">NFTs Minted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{globalStats.highestScore}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Highest Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{globalStats.totalPlayers}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active Players</p>
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-2">
          {achievementList.map((achievement) => (
            <div key={achievement.key} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{achievement.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                </div>
              </div>
              {achievements[achievement.key] ? (
                <Badge variant="default" className="bg-green-600">✓ Unlocked</Badge>
              ) : (
                <Badge variant="outline">🔒 Locked</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
