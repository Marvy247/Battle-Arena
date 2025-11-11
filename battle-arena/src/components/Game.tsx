'use client'

import dynamic from 'next/dynamic'

const PhaserGame = dynamic(() => import('./PhaserGame'), { ssr: false })

interface GameProps {
  onGameOver: (score: number) => void
}

export default function Game({ onGameOver }: GameProps) {
  return <PhaserGame onGameOver={onGameOver} />
}
