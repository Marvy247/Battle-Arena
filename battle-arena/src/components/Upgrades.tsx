'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface UpgradesProps {
  upgrades: { speed: number; health: number; damage: number }
  upgradePoints: number
  onUpgrade: (type: 'speed' | 'health' | 'damage') => void
}

export default function Upgrades({ upgrades, upgradePoints, onUpgrade }: UpgradesProps) {
  const upgradeCosts = { speed: 1, health: 2, damage: 1 }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upgrades ({upgradePoints} points)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Speed</p>
              <p className="text-sm text-gray-600">Increase movement speed</p>
              <Badge variant="outline">Level {upgrades.speed}</Badge>
            </div>
            <Button
              onClick={() => onUpgrade('speed')}
              disabled={upgradePoints < upgradeCosts.speed}
              size="sm"
            >
              Upgrade ({upgradeCosts.speed} pts)
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Health</p>
              <p className="text-sm text-gray-600">Increase max health</p>
              <Badge variant="outline">Level {upgrades.health}</Badge>
            </div>
            <Button
              onClick={() => onUpgrade('health')}
              disabled={upgradePoints < upgradeCosts.health}
              size="sm"
            >
              Upgrade ({upgradeCosts.health} pts)
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Damage</p>
              <p className="text-sm text-gray-600">Increase bullet damage</p>
              <Badge variant="outline">Level {upgrades.damage}</Badge>
            </div>
            <Button
              onClick={() => onUpgrade('damage')}
              disabled={upgradePoints < upgradeCosts.damage}
              size="sm"
            >
              Upgrade ({upgradeCosts.damage} pts)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
