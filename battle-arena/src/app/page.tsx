'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import Game from '../components/Game'
import Leaderboard from '../components/Leaderboard'
import SpectatorMode from '../components/SpectatorMode'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { Moon, Sun } from 'lucide-react'
import { BattleArenaABI, CONTRACT_ADDRESS } from '../contracts/BattleArenaABI'

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [finalScore, setFinalScore] = useState(0)
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Battle Arena</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Connect your wallet to start playing the blockchain battle arena!</p>
            <p className="text-sm text-gray-400 mb-6">Earn NFTs by achieving high scores and compete on the leaderboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startGame = () => setGameState('playing')
  const handleGameOver = (score: number) => {
    setFinalScore(score)
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4 transition-colors duration-300 pt-20">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl">
        <div className="flex flex-col gap-4">
          <Card className="w-full lg:w-[800px]">
          <CardHeader>
            <CardTitle>Real-Time Blockchain Battle Arena</CardTitle>
          </CardHeader>
          <CardContent>
            {gameState === 'menu' && (
              <div className="text-center">
                <p className="mb-4">Control your spaceship, dodge asteroids, destroy enemies!</p>
                <p className="mb-4 text-sm">Local High Score: {localHighScore}</p>
                <div className="flex gap-2 justify-center mb-4">
                  <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
                    <DialogTrigger asChild>
                      <Button variant="outline">How to Play</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>How to Play Battle Arena</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm space-y-2">
                        <p>• Use WASD or Arrow keys to move your spaceship</p>
                        <p>• Press SPACE to shoot bullets at enemies</p>
                        <p>• Press P to pause/unpause the game</p>
                        <p>• Collect power-ups for bonuses</p>
                        <p>• You have 3 lives - don't let enemies or asteroids hit you!</p>
                        <p>• Difficulty increases every 30 seconds</p>
                        <p>• Submit your score to mint an NFT and compete on the leaderboard!</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {address && (
                    <Dialog open={showNFTs} onOpenChange={setShowNFTs}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => refetchTokens()}>My NFTs ({userTokens.length})</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>My Battle Arena NFTs</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userTokens.length > 0 ? (
                            userTokens.map((tokenId, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <span>Score NFT #{tokenId.toString()}</span>
                                <Badge variant="secondary">Owned</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No NFTs yet. Play the game to earn some!</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <Button onClick={startGame}>Start Game</Button>
              </div>
            )}
            {gameState === 'playing' && <Game onGameOver={handleGameOver} />}
            {gameState === 'gameOver' && (
              <div className="text-center">
                <p className="text-2xl mb-2">Final Score: {finalScore}</p>
                {finalScore === localHighScore && finalScore > 0 && <p className="text-yellow-400 mb-4">New Local High Score!</p>}
                <div className="flex gap-2 justify-center mb-4">
                  <Button onClick={submitScore} disabled={isPending || (txHash && isConfirming)}>
                    {isPending ? 'Submitting...' : (txHash && isConfirming) ? 'Confirming...' : 'Submit Score to Blockchain'}
                  </Button>
                  <Button onClick={shareScore} variant="outline">Share Score</Button>
                  {finalScore >= 1000 && (
                    <Button onClick={() => writeContract({
                      address: CONTRACT_ADDRESS,
                      abi: BattleArenaABI,
                      functionName: 'claimReward',
                    })} variant="outline" className="bg-yellow-600 hover:bg-yellow-700">
                      Claim Champion Reward
                    </Button>
                  )}
                </div>
                <Button onClick={() => setGameState('menu')} variant="secondary">Play Again</Button>
              </div>
            )}
          </CardContent>
          </Card>
          <SpectatorMode />
        </div>
        <Leaderboard />
      </div>
    </div>
  )
}
