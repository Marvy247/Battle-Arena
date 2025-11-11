'use client'

import { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { BattleArenaABI, CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'
import { sdsClient } from '../lib/somnia'

interface ScoreEntry {
  player: string
  score: bigint
  timestamp: bigint
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([])
  const [newScoreNotification, setNewScoreNotification] = useState<string | null>(null)
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BattleArenaABI,
    functionName: 'getLeaderboard',
  })

  useEffect(() => {
    if (data) {
      setLeaderboard(data as ScoreEntry[])
    }
  }, [data])

  // Initialize SDS for real-time updates
  useEffect(() => {
    const subscribeToEvents = async () => {
      try {
        const subscription = await sdsClient.subscribe({
          eventContractSources: [CONTRACT_ADDRESS],
          topicOverrides: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'], // Transfer event for NFT mint (triggers on score submit)
          ethCalls: [{
            to: CONTRACT_ADDRESS,
            data: '0x8b6e6b6f' // getLeaderboard() selector
          }],
          onData: (data) => {
            refetch() // Update leaderboard on new score
            // Show notification for new score
            if (data && data.length > 0) {
              const latestScore = data[0]
              setNewScoreNotification(`New score: ${latestScore.score.toString()} by ${latestScore.player.slice(0, 6)}...`)
              setTimeout(() => setNewScoreNotification(null), 5000)
            }
          },
          onError: (error) => {
            console.error('SDS subscription error:', error)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to SDS:', error)
        // Fallback to polling
        const interval = setInterval(() => {
          refetch()
        }, 5000)
        return () => clearInterval(interval)
      }
    }

    const unsubscribe = subscribeToEvents()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [refetch])

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return <Badge variant="destructive">🥇 1st</Badge>
      case 1: return <Badge variant="secondary">🥈 2nd</Badge>
      case 2: return <Badge variant="outline">🥉 3rd</Badge>
      default: return <Badge variant="outline">{index + 1}th</Badge>
    }
  }

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Real-Time Leaderboard
          <Badge variant="secondary" className="text-xs">SDS Powered</Badge>
        </CardTitle>
        {newScoreNotification && (
          <div className="text-sm text-green-600 font-medium animate-pulse">
            {newScoreNotification}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.slice(0, 10).map((entry, index) => (
              <TableRow key={index} className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                <TableCell>{getRankBadge(index)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                </TableCell>
                <TableCell className="font-bold">{entry.score.toString()}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(Number(entry.timestamp) * 1000).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {leaderboard.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            No scores yet. Be the first to play!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
