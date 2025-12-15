'use client'

import { useEffect, useState, useRef } from 'react'
import { useReadContract } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { BattleArenaABI, CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'
import { sdsClient } from '../lib/somnia'
import { keccak256, toHex } from 'viem'

interface ScoreEntry {
  player: string
  score: bigint
  timestamp: bigint
}

interface ScoreNotification {
  player: string
  score: number
  tokenId: number
  id: string
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([])
  const [notifications, setNotifications] = useState<ScoreNotification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'polling'>('connecting')
  const [updateCount, setUpdateCount] = useState(0)
  const [sdsLatency, setSdsLatency] = useState<number | null>(null)
  const lastUpdateTime = useRef<number>(Date.now())
  
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

  // Initialize SDS for real-time updates with ScoreSubmitted event
  useEffect(() => {
    const subscribeToEvents = async () => {
      try {
        // Calculate ScoreSubmitted event topic: keccak256("ScoreSubmitted(address,uint256,uint256,uint256)")
        const scoreSubmittedTopic = keccak256(toHex('ScoreSubmitted(address,uint256,uint256,uint256)'))
        
        const subscription = await sdsClient.subscribe({
          eventContractSources: [CONTRACT_ADDRESS],
          topicOverrides: [scoreSubmittedTopic], // ScoreSubmitted event
          ethCalls: [{
            to: CONTRACT_ADDRESS,
            data: '0x8b6e6b6f' // getLeaderboard() selector
          }],
          onData: (data) => {
            const now = Date.now()
            const latency = now - lastUpdateTime.current
            setSdsLatency(latency)
            lastUpdateTime.current = now
            
            // Update leaderboard
            refetch()
            setUpdateCount(prev => prev + 1)
            
            // Parse event data to show notification
            try {
              if (data && Array.isArray(data) && data.length > 0) {
                const eventData = data[0]
                const notification: ScoreNotification = {
                  player: eventData.player || 'Unknown',
                  score: Number(eventData.score || 0),
                  tokenId: Number(eventData.tokenId || 0),
                  id: `${Date.now()}-${Math.random()}`
                }
                
                setNotifications(prev => [...prev, notification].slice(-3)) // Keep last 3
                
                // Remove notification after 5 seconds
                setTimeout(() => {
                  setNotifications(prev => prev.filter(n => n.id !== notification.id))
                }, 5000)
              }
            } catch (err) {
              console.error('Error parsing event data:', err)
            }
            
            setConnectionStatus('connected')
          },
          onError: (error) => {
            console.error('SDS subscription error:', error)
            setConnectionStatus('error')
          },
          onlyPushChanges: true
        })

        setConnectionStatus('connected')
        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to SDS:', error)
        setConnectionStatus('polling')
        
        // Fallback to polling every 5 seconds
        const interval = setInterval(() => {
          refetch()
          setUpdateCount(prev => prev + 1)
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
      case 0: return <Badge variant="destructive" className="bg-yellow-400 text-red-900 font-bold text-lg">🎅 1st</Badge>
      case 1: return <Badge variant="secondary" className="bg-gray-300 text-green-900 font-bold">🎄 2nd</Badge>
      case 2: return <Badge variant="outline" className="bg-orange-600 text-white font-bold">⭐ 3rd</Badge>
      default: return <Badge variant="outline" className="bg-red-900/50 text-yellow-300 border-yellow-400">{index + 1}th</Badge>
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="text-xs bg-green-600">● SDS Live</Badge>
      case 'connecting':
        return <Badge variant="secondary" className="text-xs">○ Connecting...</Badge>
      case 'error':
        return <Badge variant="destructive" className="text-xs">● Error</Badge>
      case 'polling':
        return <Badge variant="outline" className="text-xs">● Polling</Badge>
    }
  }

  return (
    <Card className="w-[500px] backdrop-blur-sm bg-white/10 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50">
      <CardHeader className="bg-gradient-to-r from-red-700 to-green-700 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 justify-between text-yellow-300">
          <div className="flex items-center gap-2">
            🎅 Santa's Nice List 🎄
            {getStatusBadge()}
          </div>
          <div className="text-xs text-yellow-200">
            {updateCount} updates
            {sdsLatency !== null && connectionStatus === 'connected' && (
              <span className="ml-2">({sdsLatency}ms)</span>
            )}
          </div>
        </CardTitle>
        {notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className="text-sm text-yellow-300 font-bold animate-pulse bg-red-900/50 p-2 rounded border-2 border-yellow-400"
              >
                🎁 New joy score: <strong>{notif.score}</strong> by {notif.player.slice(0, 6)}...{notif.player.slice(-4)}
                {notif.tokenId > 0 && <span className="ml-2">🎄 NFT #{notif.tokenId}</span>}
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="bg-gradient-to-br from-red-900/50 to-green-900/50">
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
              <TableRow key={index} className={index < 3 ? 'bg-yellow-400/20 border-b-2 border-yellow-400' : 'bg-red-900/20'}>
                <TableCell>{getRankBadge(index)}</TableCell>
                <TableCell className="font-mono text-sm text-yellow-300 font-bold">
                  {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                </TableCell>
                <TableCell className="font-bold text-yellow-300 text-lg">{entry.score.toString()} 🎄</TableCell>
                <TableCell className="text-sm text-gray-300">
                  {new Date(Number(entry.timestamp) * 1000).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {leaderboard.length === 0 && (
          <div className="text-center text-yellow-300 mt-4 text-lg">
            🎅 No scores yet. Be the first to spread Christmas joy! 🎄
          </div>
        )}
      </CardContent>
    </Card>
  )
}
