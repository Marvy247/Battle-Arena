'use client'

import dynamic from 'next/dynamic'

const PhaserGameImproved = dynamic(() => import('./PhaserGameImproved'), { ssr: false })

interface GameStats {
  score: number
  wavesSurvived: number
  accuracy: number
  bestCombo: number
  asteroidsDestroyed: number
}

interface GameProps {
  onGameOver: (score: number, stats: GameStats) => void
}

export default function Game({ onGameOver }: GameProps) {
  return <PhaserGameImproved onGameOver={onGameOver} />
}
