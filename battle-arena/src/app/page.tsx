'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import Game from '../components/Game'
import Leaderboard from '../components/Leaderboard'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { Moon, Sun } from 'lucide-react'
import { BattleArenaABI, CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'

interface GameStats {
  score: number
  wavesSurvived: number
  accuracy: number
  bestCombo: number
  asteroidsDestroyed: number
}

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [finalScore, setFinalScore] = useState(0)
  const [gameStats, setGameStats] = useState<GameStats | null>(null)
  const [localHighScore, setLocalHighScore] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showNFTs, setShowNFTs] = useState(false)
  const [userTokens, setUserTokens] = useState<bigint[]>([])
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  const { data: tokensData, refetch: refetchTokens } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BattleArenaABI,
    functionName: 'getUserTokens',
    args: address ? [address] : undefined,
  })

  useEffect(() => {
    const stored = localStorage.getItem('battleArenaHighScore')
    if (stored) setLocalHighScore(parseInt(stored))
  }, [])

  useEffect(() => {
    if (finalScore > localHighScore) {
      setLocalHighScore(finalScore)
      localStorage.setItem('battleArenaHighScore', finalScore.toString())
    }
  }, [finalScore, localHighScore])

  useEffect(() => {
    if (tokensData) {
      setUserTokens(tokensData as unknown as bigint[])
    }
  }, [tokensData])

  useEffect(() => {
    if (isConfirmed) {
      alert(`Score ${finalScore} submitted successfully! NFT minted!`)
      setGameState('menu')
      setTxHash(undefined) // Reset tx hash
    }
  }, [isConfirmed, finalScore])

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-blue-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Christmas decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-bounce">🎄</div>
          <div className="absolute top-20 right-20 text-5xl animate-pulse">⭐</div>
          <div className="absolute bottom-10 left-20 text-4xl animate-bounce">🎁</div>
          <div className="absolute bottom-20 right-10 text-5xl animate-pulse">❄️</div>
        </div>
        
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 bg-clip-text text-transparent">
              🎅 Welcome to Christmas Carnival! 🎄
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-xl">Connect your wallet to join the festive fun!</p>
            <p className="text-sm text-gray-200 mb-6">
              🎁 Catch falling gifts, avoid the Grinches, and spread Christmas joy! 
              <br />⭐ Earn NFTs and compete for the top spot on Santa's nice list!
            </p>
            <div className="text-6xl animate-pulse my-4">🎅🤶</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startGame = () => setGameState('playing')
  const handleGameOver = (score: number, stats: GameStats) => {
    setFinalScore(score)
    setGameStats(stats)
    setGameState('gameOver')
  }

  const submitScore = () => {
    if (!address) {
      alert('Please connect your wallet first!')
      return
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BattleArenaABI,
      functionName: 'submitScore',
      args: [BigInt(finalScore)],
    }, {
      onSuccess: (hash) => {
        setTxHash(hash)
      },
      onError: (error) => {
        alert(`Error submitting score: ${error.message}`)
      }
    })
  }

  const shareScore = () => {
    const text = `I scored ${finalScore} in Battle Arena on Somnia Testnet! Can you beat it? #BattleArena #Somnia`
    if (navigator.share) {
      navigator.share({ title: 'Battle Arena Score', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-blue-900 text-white flex items-center justify-center p-4 transition-colors duration-300 pt-20 relative overflow-hidden">
      {/* Falling snow effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white text-2xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            ❄️
          </div>
        ))}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl w-full z-10">
        <div className="flex flex-col gap-4 flex-1">
          <Card className="w-full lg:w-[800px] backdrop-blur-sm bg-white/10 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50">
          <CardHeader className="bg-gradient-to-r from-red-600 to-green-600 rounded-t-lg">
            <CardTitle className="text-center text-3xl font-bold text-yellow-300">
              🎄 Christmas Carnival - Festive Fun on Somnia! 🎅
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-red-900/50 to-green-900/50">
            {gameState === 'menu' && (
              <div className="text-center">
                <p className="mb-4 text-xl">🎅 Help Santa catch gifts and spread Christmas joy! 🎁</p>
                <p className="mb-4 text-lg font-bold text-yellow-300">🎯 Best Joy Score: {localHighScore} ⭐</p>
                <div className="flex gap-2 justify-center mb-4">
                  <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
                    <DialogTrigger asChild>
                      <Button variant="outline">How to Play</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-red-900 to-green-900 text-white border-4 border-yellow-400">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-yellow-300">🎄 How to Play Christmas Carnival 🎅</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm space-y-2">
                        <p>🎮 <strong>Move:</strong> WASD or Arrow keys to guide Santa's sleigh</p>
                        <p>🎁 <strong>Shoot:</strong> SPACE to throw snowballs at the Grinches!</p>
                        <p>⏸️ <strong>Pause:</strong> ESC to pause/unpause the game</p>
                        <p>⭐ <strong>Power-ups:</strong> Collect candy canes, gingerbread, and presents!</p>
                        <p>❤️ <strong>Health:</strong> Don't let the Grinches steal Christmas!</p>
                        <p>🎄 <strong>Rounds:</strong> Survive festive rounds - difficulty increases!</p>
                        <p>🏆 <strong>NFTs:</strong> Submit your joy score to mint an NFT and join Santa's nice list!</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {address && (
                    <Dialog open={showNFTs} onOpenChange={setShowNFTs}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => refetchTokens()} className="bg-green-700 hover:bg-green-800 text-white border-yellow-400">
                          🎁 My NFTs ({userTokens.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gradient-to-br from-red-900 to-green-900 text-white border-4 border-yellow-400">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-yellow-300">🎄 My Christmas NFT Collection 🎅</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userTokens.length > 0 ? (
                            userTokens.map((tokenId, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border-2 border-yellow-400 rounded bg-white/10">
                                <span>🎁 Christmas Joy NFT #{tokenId.toString()}</span>
                                <Badge variant="secondary" className="bg-yellow-400 text-red-900">On Nice List!</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-300">No NFTs yet. Spread Christmas joy to earn some! 🎅</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <Button onClick={startGame} className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-bold text-xl py-6 px-8 border-4 border-yellow-400 shadow-lg shadow-yellow-400/50">
                  🎅 Start Christmas Adventure! 🎄
                </Button>
              </div>
            )}
            {gameState === 'playing' && <Game onGameOver={handleGameOver} />}
            {gameState === 'gameOver' && gameStats && (
              <div className="text-center">
                <p className="text-4xl font-bold mb-4 text-yellow-300">🎄 Christmas Joy: {finalScore.toLocaleString()} ⭐</p>
                {finalScore === localHighScore && finalScore > 0 && (
                  <p className="text-yellow-300 mb-4 animate-pulse text-2xl">🏆 New Record! Santa's Favorite! 🎅</p>
                )}
                
                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
                  <div className="bg-red-900/50 p-3 rounded border-2 border-yellow-400">
                    <p className="text-sm text-gray-200">🎄 Rounds Survived</p>
                    <p className="text-2xl font-bold text-yellow-300">{gameStats.wavesSurvived}</p>
                  </div>
                  <div className="bg-green-900/50 p-3 rounded border-2 border-yellow-400">
                    <p className="text-sm text-gray-200">🎯 Accuracy</p>
                    <p className="text-2xl font-bold text-yellow-300">{gameStats.accuracy}%</p>
                  </div>
                  <div className="bg-red-900/50 p-3 rounded border-2 border-yellow-400">
                    <p className="text-sm text-gray-200">🔥 Best Combo</p>
                    <p className="text-2xl font-bold text-yellow-300">{gameStats.bestCombo}x ⭐</p>
                  </div>
                  <div className="bg-green-900/50 p-3 rounded border-2 border-yellow-400">
                    <p className="text-sm text-gray-200">🎁 Gifts Collected</p>
                    <p className="text-2xl font-bold text-yellow-300">{gameStats.asteroidsDestroyed}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-center mb-4 flex-wrap">
                  <Button onClick={submitScore} disabled={isPending || (txHash && isConfirming)} className="bg-red-600 hover:bg-red-700 text-white border-2 border-yellow-400">
                    {isPending ? '🎁 Wrapping Gift...' : (txHash && isConfirming) ? '🎄 Confirming...' : '🎅 Submit to Santa\'s List!'}
                  </Button>
                  <Button onClick={shareScore} variant="outline" className="border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-red-900">
                    ⭐ Share Joy
                  </Button>
                  {finalScore >= 1000 && (
                    <Button onClick={() => writeContract({
                      address: CONTRACT_ADDRESS,
                      abi: BattleArenaABI,
                      functionName: 'claimReward',
                    })} variant="outline" className="bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 text-white font-bold">
                      🏆 Claim Christmas Reward!
                    </Button>
                  )}
                </div>
                <Button onClick={() => setGameState('menu')} variant="secondary" className="bg-green-700 hover:bg-green-800 text-white border-2 border-yellow-400 text-lg py-4 px-6">
                  🎄 Celebrate Again!
                </Button>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
        <Leaderboard />
      </div>
    </div>
  )
}
