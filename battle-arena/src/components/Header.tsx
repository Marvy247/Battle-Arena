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
    <header className="fixed top-0 left-0 right-0 z-10 w-full bg-transparent backdrop-blur-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Battle Arena</h1>
        <div className="flex items-center gap-2">
          <Button onClick={toggleTheme} variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black bg-transparent">
            {isDarkMode ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
          </Button>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
