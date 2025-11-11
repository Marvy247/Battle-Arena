'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { sdsClient } from '../lib/somnia'

interface AchievementsProps {
  achievements: { [key: string]: boolean }
}

export default function Achievements({ achievements }: AchievementsProps) {
  const [globalAchievements, setGlobalAchievements] = useState<{ [key: string]: number }>({})
  const achievementList = [
    { key: 'firstKill', name: 'First Blood', description: 'Destroy your first enemy' },
    { key: 'combo10', name: 'Combo Master', description: 'Achieve a 10x combo' },
    { key: 'level5', name: 'Survivor', description: 'Reach level 5' },
    { key: 'score1000', name: 'High Scorer', description: 'Score 1000 points' },
    { key: 'asteroid100', name: 'Asteroid Crusher', description: 'Destroy 100 asteroids' },
  ]

  // Initialize SDS for real-time global achievement updates
  useEffect(() => {
    const subscribeToAchievements = async () => {
      try {
        // This would subscribe to achievement events from the contract
        // For demo purposes, we'll simulate global achievement counts
        const subscription = await sdsClient.subscribe({
          eventContractSources: [], // Would be contract addresses tracking achievements
          topicOverrides: [],
          ethCalls: [],
          onData: (data) => {
            // Update global achievement counts in real-time
            setGlobalAchievements(prev => ({
              ...prev,
              firstKill: (prev.firstKill || 0) + 1,
              combo10: (prev.combo10 || 0) + Math.floor(Math.random() * 3),
            }))
          },
          onError: (error) => {
            console.error('SDS achievement subscription error:', error)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to achievement SDS:', error)
      }
    }

    const unsubscribe = subscribeToAchievements()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Achievements
          <Badge variant="secondary" className="text-xs">Real-Time</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {achievementList.map((achievement) => (
            <div key={achievement.key} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                {globalAchievements[achievement.key] && (
                  <p className="text-xs text-blue-600">
                    Global unlocks: {globalAchievements[achievement.key]}
                  </p>
                )}
              </div>
              {achievements[achievement.key] ? (
                <Badge variant="default">Unlocked</Badge>
              ) : (
                <Badge variant="secondary">Locked</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
