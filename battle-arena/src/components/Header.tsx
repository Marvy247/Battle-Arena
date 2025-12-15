'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '../components/ui/button'
import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

export default function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-red-900 via-green-900 to-red-900 backdrop-blur-md p-2 md:p-4 border-b-2 md:border-b-4 border-yellow-400 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
        <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-yellow-300 via-red-300 to-green-300 bg-clip-text text-transparent animate-pulse">
          🎄 BattleArena <span className="hidden md:inline">🎅</span>
        </h1>
        <div className="flex items-center gap-1 md:gap-2">
          <Button onClick={toggleTheme} variant="outline" size="sm" className="text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-red-900 bg-transparent font-bold hidden md:flex">
            {isDarkMode ? <Sun className="h-4 w-4 text-yellow-300" /> : <Moon className="h-4 w-4 text-yellow-300" />}
          </Button>
          <div className="scale-75 md:scale-100 origin-right">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}
