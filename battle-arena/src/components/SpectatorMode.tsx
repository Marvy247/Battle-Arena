'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

export default function SpectatorMode() {
  return (
    <Card className="w-full max-w-md border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Live Spectator Mode
          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Watch live games in real-time using Somnia Data Streams
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-left">
            <p className="text-xs font-semibold mb-2">Future Implementation:</p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Subscribe to on-chain game session events</li>
              <li>• Stream live player positions via SDS</li>
              <li>• Real-time score and health updates</li>
              <li>• Multi-game spectating with viewer count</li>
              <li>• Instant replay of highlight moments</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            This feature requires additional game state contracts for broadcasting live gameplay data through Somnia Data Streams.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

