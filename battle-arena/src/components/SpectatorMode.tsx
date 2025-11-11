'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { sdsClient } from '../lib/somnia'

interface GameState {
  playerX: number
  playerY: number
  score: number
  health: number
  asteroids: Array<{ x: number; y: number; velocityY: number }>
  bullets: Array<{ x: number; y: number; velocityY: number }>
  timestamp: number
}

export default function SpectatorMode() {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [spectatorCount, setSpectatorCount] = useState(0)

  // Initialize SDS for live game state streaming
  useEffect(() => {
    if (!isWatching) return

    const subscribeToGameState = async () => {
      try {
        // This would subscribe to game state streams from active games
        // For demo purposes, we'll simulate real-time game state updates
        const subscription = await sdsClient.subscribe({
          eventContractSources: [], // Would be game session contract addresses
          topicOverrides: [],
          ethCalls: [],
          onData: (data) => {
            // Simulate receiving real-time game state updates
            const mockGameState: GameState = {
              playerX: Math.random() * 800,
              playerY: Math.random() * 600,
              score: Math.floor(Math.random() * 1000),
              health: Math.floor(Math.random() * 100) + 1,
              asteroids: Array.from({ length: 5 }, () => ({
                x: Math.random() * 800,
                y: Math.random() * 600,
                velocityY: Math.random() * 200 + 100
              })),
              bullets: Array.from({ length: 3 }, () => ({
                x: Math.random() * 800,
                y: Math.random() * 300,
                velocityY: -500
              })),
              timestamp: Date.now()
            }
            setCurrentGame(mockGameState)
            setSpectatorCount(prev => prev + Math.floor(Math.random() * 3))
          },
          onError: (error) => {
            console.error('SDS game state subscription error:', error)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to game state SDS:', error)
      }
    }

    const unsubscribe = subscribeToGameState()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [isWatching])

  const startSpectating = () => {
    setIsWatching(true)
    setSpectatorCount(1)
  }

  const stopSpectating = () => {
    setIsWatching(false)
    setCurrentGame(null)
    setSpectatorCount(0)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Live Spectator Mode
          <Badge variant="secondary" className="text-xs">SDS Streaming</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isWatching ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Watch live games in real-time using Somnia Data Streams
            </p>
            <Button onClick={startSpectating}>Start Spectating</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">Live</Badge>
              <span className="text-sm text-gray-500">
                {spectatorCount} watching
              </span>
            </div>

            {currentGame ? (
              <div className="space-y-2">
                <div className="bg-gray-900 rounded p-4 relative" style={{ width: '300px', height: '200px' }}>
                  {/* Simple ASCII art representation of game state */}
                  <div className="text-green-400 font-mono text-xs">
                    <div>Score: {currentGame.score}</div>
                    <div>Health: {currentGame.health}</div>
                    <div className="mt-2">
                      {Array.from({ length: 10 }, (_, y) =>
                        Array.from({ length: 30 }, (_, x) => {
                          const playerHere = Math.abs(x * 10 - currentGame.playerX) < 20 && Math.abs(y * 20 - currentGame.playerY) < 20
                          const asteroidHere = currentGame.asteroids.some(a => Math.abs(x * 10 - a.x) < 10 && Math.abs(y * 20 - a.y) < 10)
                          const bulletHere = currentGame.bullets.some(b => Math.abs(x * 10 - b.x) < 5 && Math.abs(y * 20 - b.y) < 5)

                          if (playerHere) return '🚀'
                          if (bulletHere) return '•'
                          if (asteroidHere) return '💥'
                          return ' '
                        }).join('')
                      ).join('\n')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Real-time game state via SDS
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Waiting for live game data...
              </div>
            )}

            <Button onClick={stopSpectating} variant="outline" size="sm">
              Stop Spectating
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
