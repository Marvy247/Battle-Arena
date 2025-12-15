'use client'

import { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'

interface GameProps {
  onGameOver: (score: number, stats: GameStats) => void
}

interface GameStats {
  score: number
  wavesSurvived: number
  accuracy: number
  bestCombo: number
  asteroidsDestroyed: number
}

export default function PhaserGameImproved({ onGameOver }: GameProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const gameInstanceRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current || gameInstanceRef.current) return

    class GameScene extends Phaser.Scene {
      // Core game objects
      private player!: Phaser.Physics.Arcade.Sprite
      private asteroids!: Phaser.Physics.Arcade.Group
      private bullets!: Phaser.Physics.Arcade.Group
      private powerUps!: Phaser.Physics.Arcade.Group
      
      // Score & Combo System
      private score = 0
      private combo = 0
      private scoreMultiplier = 1
      private lastKillTime = 0
      private bestCombo = 0
      private comboTimer: Phaser.Time.TimerEvent | null = null
      
      // Wave System
      private wave = 1
      private asteroidsInWave = 10
      private asteroidsDestroyedInWave = 0
      private totalAsteroidsDestroyed = 0
      
      // Health & Shield
      private health = 100
      private maxHealth = 100
      private shield = 0
      private maxShield = 50
      
      // Power-ups
      private rapidFire = false
      private rapidFireEndTime = 0
      private speedBoost = false
      private speedBoostEndTime = 0
      private scoreBoostActive = false
      private scoreBoostEndTime = 0
      
      // UI Elements
      private scoreText!: Phaser.GameObjects.Text
      private comboText!: Phaser.GameObjects.Text
      private waveText!: Phaser.GameObjects.Text
      private powerUpText!: Phaser.GameObjects.Text
      private healthBar!: Phaser.GameObjects.Graphics
      private shieldBar!: Phaser.GameObjects.Graphics
      
      // Controls
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
      private wasdKeys!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key }
      private spaceKey!: Phaser.Input.Keyboard.Key
      private escKey!: Phaser.Input.Keyboard.Key
      private lastFired = 0
      
      // Game State
      private isPaused = false
      private pauseMenu!: Phaser.GameObjects.Container
      private showTutorial = true
      private tutorialContainer!: Phaser.GameObjects.Container
      
      // Stats tracking
      private shotsFired = 0
      private shotsHit = 0
      private gameStartTime = 0
      private asteroidSpawnTimer?: Phaser.Time.TimerEvent

      preload() {
        // Create Santa sleigh SVG (without emojis for btoa compatibility)
        const createSantaSVG = () => {
          const svg = `
            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <!-- Sleigh body -->
              <ellipse cx="25" cy="35" rx="18" ry="10" fill="#8B4513" stroke="#654321" stroke-width="2"/>
              <rect x="10" y="25" width="30" height="12" rx="3" fill="#654321"/>
              
              <!-- Santa -->
              <circle cx="25" cy="20" r="8" fill="#FFE4C4"/>
              <circle cx="25" cy="13" r="7" fill="#DC143C"/>
              <circle cx="25" cy="10" r="2" fill="#FFFFFF"/>
              <rect x="22" y="18" width="6" height="4" fill="#FFFFFF"/>
              
              <!-- Stars decoration -->
              <polygon points="15,28 16,30 18,30 16.5,31.5 17,33 15,31.5 13,33 13.5,31.5 12,30 14,30" fill="#FFD700"/>
              <polygon points="30,28 31,30 33,30 31.5,31.5 32,33 30,31.5 28,33 28.5,31.5 27,30 29,30" fill="#FFD700"/>
            </svg>
          `
          return 'data:image/svg+xml;base64,' + btoa(svg)
        }

        const createGrinchSVG = () => {
          const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <!-- Grinch/ornament -->
              <circle cx="20" cy="20" r="18" fill="#DC143C" stroke="#8B0000" stroke-width="2"/>
              <circle cx="20" cy="15" r="8" fill="#228B22"/>
              <rect x="18" y="5" width="4" height="8" fill="#FFD700"/>
              <circle cx="20" cy="5" r="2" fill="#FFD700"/>
              
              <!-- Grinch face -->
              <circle cx="15" cy="20" r="2" fill="#000000"/>
              <circle cx="25" cy="20" r="2" fill="#000000"/>
              <path d="M 15 25 Q 20 28 25 25" stroke="#000000" stroke-width="2" fill="none"/>
            </svg>
          `
          return 'data:image/svg+xml;base64,' + btoa(svg)
        }

        const createSnowballSVG = () => {
          const svg = `
            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" fill="#FFFFFF" stroke="#B0E0E6" stroke-width="2"/>
              <circle cx="6" cy="6" r="2" fill="#E0F6FF" opacity="0.6"/>
              <circle cx="10" cy="9" r="1.5" fill="#E0F6FF" opacity="0.5"/>
            </svg>
          `
          return 'data:image/svg+xml;base64,' + btoa(svg)
        }

        this.load.image('player', createSantaSVG())
        this.load.image('asteroid', createGrinchSVG())
        this.load.image('bullet', createSnowballSVG())
      }

      create() {
        this.gameStartTime = this.time.now

        // Create animated starfield
        this.createStarfield()

        // Create player (centered based on game width)
        const centerX = this.cameras.main.width / 2
        const playerY = this.cameras.main.height - 100
        this.player = this.physics.add.sprite(centerX, playerY, 'player')
        this.player.setCollideWorldBounds(true)
        this.player.setScale(0.8)
        this.player.setDepth(10)

        // Create groups
        this.asteroids = this.physics.add.group()
        this.bullets = this.physics.add.group()
        this.powerUps = this.physics.add.group()

        // Create HUD
        this.createHUD()

        // Setup keyboard controls
        if (this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys()
          this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
          }) as any
          this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
          this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
          this.escKey.on('down', this.togglePause, this)
        }

        // Setup touch controls for mobile
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (!this.isPaused && !this.showTutorial) {
            // Auto-fire on touch
            const time = this.time.now
            if (time > this.lastFired) {
              this.shootBullet()
              this.lastFired = time + 150
            }
          }
        })

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (pointer.isDown && !this.isPaused && !this.showTutorial) {
            // Move player to pointer X position
            this.player.x = Phaser.Math.Clamp(pointer.x, 25, this.cameras.main.width - 25)
          }
        })

        // Setup collisions
        this.physics.add.overlap(this.player, this.asteroids, this.hitAsteroid, undefined, this)
        this.physics.add.overlap(this.bullets, this.asteroids, this.destroyAsteroid, undefined, this)
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, undefined, this)

        // Start wave system
        this.startWave()

        // Show tutorial for first-time players
        if (this.showTutorial) {
          this.createTutorial()
        }
      }

      createStarfield() {
        // Create Christmas snow and stars background
        for (let i = 0; i < 80; i++) {
          const x = Phaser.Math.Between(0, 800)
          const y = Phaser.Math.Between(0, 600)
          const size = Phaser.Math.FloatBetween(1, 3)
          const alpha = Phaser.Math.FloatBetween(0.4, 1)
          
          // Mix of snowflakes and stars
          const isSnow = i % 3 === 0
          const color = isSnow ? 0xFFFFFF : 0xFFD700
          const star = this.add.circle(x, y, size, color, alpha)
          
          // Twinkling and falling effect
          this.tweens.add({
            targets: star,
            alpha: { from: alpha, to: alpha * 0.3 },
            y: y + Phaser.Math.Between(50, 200),
            duration: Phaser.Math.Between(2000, 5000),
            yoyo: true,
            repeat: -1
          })
        }
        
        // Add some festive decorations
        for (let i = 0; i < 10; i++) {
          const x = Phaser.Math.Between(50, 750)
          const y = Phaser.Math.Between(50, 150)
          const decorSize = Phaser.Math.FloatBetween(3, 5)
          const decorColor = [0xFF0000, 0x00FF00, 0xFFD700][i % 3]
          const decor = this.add.circle(x, y, decorSize, decorColor, 0.6)
          
          this.tweens.add({
            targets: decor,
            scale: { from: 1, to: 1.3 },
            duration: Phaser.Math.Between(1000, 2000),
            yoyo: true,
            repeat: -1
          })
        }
      }

      createHUD() {
        // Responsive font size based on game width
        const fontSize = this.cameras.main.width < 500 ? '18px' : '26px'
        const comboFontSize = this.cameras.main.width < 500 ? '24px' : '36px'
        
        // Score
        this.scoreText = this.add.text(10, 10, '🎄 JOY: 0', {
          fontSize: fontSize,
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 3
        }).setDepth(100)

        // Wave
        this.waveText = this.add.text(this.cameras.main.width - 10, 10, '🎅 ROUND 1', {
          fontSize: fontSize,
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#228B22',
          strokeThickness: 3
        }).setOrigin(1, 0).setDepth(100)

        // Combo
        this.comboText = this.add.text(this.cameras.main.width / 2, 50, '', {
          fontSize: comboFontSize,
          color: '#FFFF00',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(100).setVisible(false)

        // Power-up status
        const powerUpFontSize = this.cameras.main.width < 500 ? '12px' : '18px'
        this.powerUpText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 40, '', {
          fontSize: powerUpFontSize,
          color: '#FFFF00',
          fontFamily: 'Arial Black',
          backgroundColor: '#DC143C',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(100)

        // Health and Shield bars
        this.healthBar = this.add.graphics().setDepth(100)
        this.shieldBar = this.add.graphics().setDepth(100)
        this.updateBars()
      }

      updateBars() {
        // Clear previous
        this.healthBar.clear()
        this.shieldBar.clear()

        const barWidth = 200
        const barHeight = 20
        const x = 20
        const y = 60

        // Health bar background
        this.healthBar.fillStyle(0x000000, 0.5)
        this.healthBar.fillRect(x, y, barWidth, barHeight)

        // Health bar fill (Christmas colors based on health)
        let healthColor = 0x00FF00  // Green for good health
        if (this.health < 30) healthColor = 0xFF0000  // Red for danger
        else if (this.health < 60) healthColor = 0xFFD700  // Gold for medium

        this.healthBar.fillStyle(healthColor, 1)
        this.healthBar.fillRect(x, y, (this.health / this.maxHealth) * barWidth, barHeight)

        // Health bar border - festive gold
        this.healthBar.lineStyle(3, 0xFFD700)
        this.healthBar.strokeRect(x, y, barWidth, barHeight)

        // Health text
        this.healthBar.fillStyle(0xFFFFFF)

        // Shield bar (if active) - icy blue
        if (this.shield > 0) {
          this.shieldBar.fillStyle(0xADD8E6, 0.8)
          this.shieldBar.fillRect(x, y + barHeight + 5, (this.shield / this.maxShield) * barWidth, 10)
          this.shieldBar.lineStyle(2, 0xFFFFFF)
          this.shieldBar.strokeRect(x, y + barHeight + 5, barWidth, 10)
        }
      }

      startWave() {
        this.asteroidsDestroyedInWave = 0
        this.asteroidsInWave = 10 + (this.wave - 1) * 5 // Increase Grinches per round

        // Show wave notification
        const waveNotif = this.add.text(400, 300, `🎄 ROUND ${this.wave} 🎅`, {
          fontSize: '64px',
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 8
        }).setOrigin(0.5).setDepth(200).setAlpha(0)

        this.tweens.add({
          targets: waveNotif,
          alpha: 1,
          scale: { from: 0.5, to: 1.5 },
          duration: 800,
          onComplete: () => {
            this.time.delayedCall(1000, () => {
              this.tweens.add({
                targets: waveNotif,
                alpha: 0,
                duration: 500,
                onComplete: () => waveNotif.destroy()
              })
            })
          }
        })

        // Update wave text
        this.waveText.setText(`🎅 ROUND ${this.wave}`)

        // Start spawning asteroids
        const spawnDelay = Math.max(400, 800 - (this.wave * 30)) // Faster spawning in higher waves
        this.asteroidSpawnTimer = this.time.addEvent({
          delay: spawnDelay,
          callback: this.spawnAsteroid,
          callbackScope: this,
          loop: true
        })
      }

      update(time: number) {
        if (this.isPaused) return

        // Player movement with WASD or Arrow keys (if available)
        const moveSpeed = this.speedBoost ? 450 : 300
        
        if (this.cursors && this.wasdKeys) {
          if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-moveSpeed)
          } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(moveSpeed)
          } else {
            this.player.setVelocityX(0)
          }

          if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            this.player.setVelocityY(-moveSpeed)
          } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            this.player.setVelocityY(moveSpeed)
          } else {
            this.player.setVelocityY(0)
          }

          // Shooting with spacebar
          const fireRate = this.rapidFire ? 80 : 150
          if (this.spaceKey && this.spaceKey.isDown && time > this.lastFired) {
            this.shootBullet()
            this.lastFired = time + fireRate
          }
        }

        // Player rotation
        this.player.rotation = this.player.body!.velocity.x * 0.0003

        // Check power-up expiration
        this.checkPowerUps(time)

        // Cleanup off-screen objects
        this.cleanupObjects()

        // Check wave completion
        if (this.asteroidsDestroyedInWave >= this.asteroidsInWave) {
          this.wave++
          this.startWave()
          // Bonus score for completing wave
          this.addScore(this.wave * 100)
          this.showFloatingText(400, 300, `+${this.wave * 100} WAVE BONUS!`, '#FFD700', 36)
        }
      }

      shootBullet() {
        this.shotsFired++
        
        if (this.rapidFire) {
          // Triple shot
          const bullet1 = this.bullets.create(this.player.x - 15, this.player.y - 20, 'bullet')
          const bullet2 = this.bullets.create(this.player.x, this.player.y - 25, 'bullet')
          const bullet3 = this.bullets.create(this.player.x + 15, this.player.y - 20, 'bullet')
          
          bullet1.setVelocity(-50, -600)
          bullet2.setVelocityY(-650)
          bullet3.setVelocity(50, -600)
          
          ;[bullet1, bullet2, bullet3].forEach(b => {
            b.setScale(1.2)
            this.createBulletTrail(b)
          })
        } else {
          const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet')
          bullet.setVelocityY(-500)
          this.createBulletTrail(bullet)
        }
      }

      createBulletTrail(bullet: any) {
        // Glowing trail effect
        this.tweens.add({
          targets: bullet,
          alpha: { from: 1, to: 0.3 },
          scale: { from: 1, to: 0.8 },
          duration: 300,
          yoyo: true,
          repeat: -1
        })

        this.time.delayedCall(3000, () => {
          if (bullet.active) bullet.destroy()
        })
      }

      spawnAsteroid() {
        const maxX = this.cameras.main.width - 50
        const x = Phaser.Math.Between(50, maxX)
        const asteroid = this.asteroids.create(x, -50, 'asteroid')
        
        // Speed increases with waves
        const baseSpeed = 100 + (this.wave * 15)
        const speed = Phaser.Math.Between(baseSpeed, baseSpeed + 100)
        
        asteroid.setVelocityY(speed)
        asteroid.setAngularVelocity(Phaser.Math.Between(-100, 100))
        asteroid.setScale(Phaser.Math.FloatBetween(0.7, 1.3))
        
        // Store size for score calculation
        asteroid.setData('size', asteroid.scale)

        this.time.delayedCall(15000, () => {
          if (asteroid.active) asteroid.destroy()
        })
      }

      spawnPowerUp(x: number, y: number, type: string) {
        const powerUp = this.physics.add.sprite(x, y, 'asteroid')
        powerUp.setScale(0.6)
        powerUp.setVelocityY(80)
        powerUp.setData('type', type)

        // Different colors for different power-ups
        const colors = {
          health: 0x00FF00,
          shield: 0x00AAFF,
          rapidFire: 0xFF5252,
          speedBoost: 0xFFEB3B,
          scoreBoost: 0xFF00FF
        }
        powerUp.setTint(colors[type as keyof typeof colors] || 0xFFFFFF)

        // Pulsing effect
        this.tweens.add({
          targets: powerUp,
          scale: { from: 0.6, to: 0.9 },
          duration: 500,
          yoyo: true,
          repeat: -1
        })

        // Glow effect
        const glow = this.add.circle(x, y, 20, colors[type as keyof typeof colors] || 0xFFFFFF, 0.3)
        glow.setDepth(-1)
        this.tweens.add({
          targets: glow,
          scale: { from: 1, to: 1.5 },
          alpha: { from: 0.3, to: 0 },
          duration: 800,
          repeat: -1
        })

        // Follow power-up position
        this.tweens.add({
          targets: glow,
          y: { from: y, to: 700 },
          duration: (700 - y) / 80 * 1000,
          onUpdate: () => {
            glow.x = powerUp.x
            glow.y = powerUp.y
          },
          onComplete: () => glow.destroy()
        })

        this.time.delayedCall(8000, () => {
          if (powerUp.active) {
            powerUp.destroy()
            glow.destroy()
          }
        })
      }

      collectPowerUp(player: any, powerUp: any) {
        const type = powerUp.getData('type')
        const currentTime = this.time.now

        switch (type) {
          case 'health':
            this.health = Math.min(this.maxHealth, this.health + 40)
            this.showFloatingText(powerUp.x, powerUp.y, '+40 HP', '#00FF00')
            break
          case 'shield':
            this.shield = this.maxShield
            this.showFloatingText(powerUp.x, powerUp.y, 'SHIELD!', '#00AAFF')
            break
          case 'rapidFire':
            this.rapidFire = true
            this.rapidFireEndTime = currentTime + 10000
            this.showFloatingText(powerUp.x, powerUp.y, 'RAPID FIRE!', '#FF5252')
            break
          case 'speedBoost':
            this.speedBoost = true
            this.speedBoostEndTime = currentTime + 8000
            this.showFloatingText(powerUp.x, powerUp.y, 'SPEED BOOST!', '#FFEB3B')
            break
          case 'scoreBoost':
            this.scoreBoostActive = true
            this.scoreBoostEndTime = currentTime + 15000
            this.showFloatingText(powerUp.x, powerUp.y, '2X SCORE!', '#FF00FF')
            break
        }

        this.cameras.main.flash(200, ...this.hexToRgb(powerUp.tintTopLeft))
        this.updateBars()
        powerUp.destroy()
      }

      hexToRgb(hex: number): [number, number, number] {
        return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      }

      checkPowerUps(time: number) {
        const powerUps = []

        if (this.rapidFire && time < this.rapidFireEndTime) {
          const remaining = Math.ceil((this.rapidFireEndTime - time) / 1000)
          powerUps.push(`🔫 RAPID FIRE: ${remaining}s`)
        } else {
          this.rapidFire = false
        }

        if (this.speedBoost && time < this.speedBoostEndTime) {
          const remaining = Math.ceil((this.speedBoostEndTime - time) / 1000)
          powerUps.push(`⚡ SPEED: ${remaining}s`)
        } else {
          this.speedBoost = false
        }

        if (this.scoreBoostActive && time < this.scoreBoostEndTime) {
          const remaining = Math.ceil((this.scoreBoostEndTime - time) / 1000)
          powerUps.push(`💎 2X SCORE: ${remaining}s`)
        } else {
          this.scoreBoostActive = false
        }

        this.powerUpText.setText(powerUps.join(' | '))
      }

      destroyAsteroid(bullet: any, asteroid: any) {
        this.shotsHit++
        this.asteroidsDestroyedInWave++
        this.totalAsteroidsDestroyed++

        // Combo system
        const currentTime = this.time.now
        if (currentTime - this.lastKillTime < 2000) {
          this.combo++
        } else {
          this.combo = 1
        }
        this.lastKillTime = currentTime

        // Update best combo
        if (this.combo > this.bestCombo) {
          this.bestCombo = this.combo
        }

        // Calculate score multiplier from combo
        if (this.combo >= 10) this.scoreMultiplier = 5
        else if (this.combo >= 5) this.scoreMultiplier = 3
        else if (this.combo >= 3) this.scoreMultiplier = 2
        else this.scoreMultiplier = 1

        // Base score with multipliers
        let points = 10 * this.scoreMultiplier
        if (this.scoreBoostActive) points *= 2

        this.addScore(points)
        this.showFloatingText(asteroid.x, asteroid.y, `+${points}`, '#FFFF00', 20)

        // Show combo
        if (this.combo >= 3) {
          this.comboText.setText(`COMBO x${this.combo}! 🔥`)
          this.comboText.setVisible(true)
          this.comboText.setScale(1)
          
          this.tweens.add({
            targets: this.comboText,
            scale: this.combo >= 10 ? 1.5 : 1.2,
            duration: 200,
            yoyo: true
          })

          // Reset combo text timer
          if (this.comboTimer) {
            this.comboTimer.remove()
          }
          this.comboTimer = this.time.delayedCall(2000, () => {
            this.comboText.setVisible(false)
          })
        }

        // Enhanced explosion
        this.createEnhancedExplosion(asteroid.x, asteroid.y, this.combo)

        bullet.destroy()
        asteroid.destroy()

        // Spawn power-ups (higher chance in later waves)
        const powerUpChance = Math.min(30, 15 + this.wave * 2)
        if (Phaser.Math.Between(1, 100) <= powerUpChance) {
          const powerUpTypes = ['health', 'shield', 'rapidFire', 'speedBoost', 'scoreBoost']
          const type = Phaser.Utils.Array.GetRandom(powerUpTypes)
          this.spawnPowerUp(asteroid.x, asteroid.y, type)
        }

        // Slow-motion effect on high combos
        if (this.combo === 10 || this.combo === 20) {
          this.cameras.main.flash(300, 255, 215, 0)
          this.time.timeScale = 0.5
          this.time.delayedCall(500, () => {
            this.time.timeScale = 1
          })
        }
      }

      createEnhancedExplosion(x: number, y: number, intensity: number = 1) {
        const particleCount = Math.min(20, 8 + intensity * 2)
        const colors = [0xFFA500, 0xFF5252, 0xFFEB3B, 0xFF6B00]

        for (let i = 0; i < particleCount; i++) {
          const color = Phaser.Utils.Array.GetRandom(colors)
          const size = Phaser.Math.Between(3, 10)
          const particle = this.add.circle(x, y, size, color)
          particle.setDepth(50)

          const angle = (Math.PI * 2 * i) / particleCount
          const speed = Phaser.Math.Between(50, 150)
          const targetX = x + Math.cos(angle) * speed
          const targetY = y + Math.sin(angle) * speed

          this.tweens.add({
            targets: particle,
            x: targetX,
            y: targetY,
            alpha: 0,
            scale: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
        }

        // Screen shake for big explosions
        if (intensity >= 5) {
          this.cameras.main.shake(100, 0.005 * Math.min(intensity, 10))
        }
      }

      hitAsteroid(player: any, asteroid: any) {
        // Check shield first
        if (this.shield > 0) {
          this.shield -= 25
          if (this.shield < 0) {
            this.health += this.shield // Apply overflow damage
            this.shield = 0
          }
          this.showFloatingText(this.player.x, this.player.y - 40, 'SHIELD!', '#00AAFF', 24)
        } else {
          this.health -= 25
          this.showFloatingText(this.player.x, this.player.y - 40, '-25 HP', '#FF0000', 24)
        }

        // Reset combo on hit
        if (this.combo > 0) {
          this.combo = 0
          this.comboText.setVisible(false)
        }

        this.updateBars()
        this.cameras.main.shake(150, 0.01)
        this.createEnhancedExplosion(asteroid.x, asteroid.y, 3)
        
        // Flash player red
        this.tweens.add({
          targets: this.player,
          tint: { from: 0xFF0000, to: 0xFFFFFF },
          duration: 200,
          repeat: 2
        })

        asteroid.destroy()

        if (this.health <= 0) {
          this.gameOver()
        }
      }

      addScore(points: number) {
        this.score += points
        this.scoreText.setText(`🎄 JOY: ${this.score.toLocaleString()}`)
      }

      showFloatingText(x: number, y: number, text: string, color: string = '#FFFFFF', size: number = 24) {
        const floatingText = this.add.text(x, y, text, {
          fontSize: `${size}px`,
          color: color,
          fontFamily: 'Arial Black',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(150)

        this.tweens.add({
          targets: floatingText,
          y: y - 50,
          alpha: 0,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => floatingText.destroy()
        })
      }

      cleanupObjects() {
        this.asteroids.children.entries.forEach((asteroid: any) => {
          if (asteroid.y > 650) asteroid.destroy()
        })

        this.bullets.children.entries.forEach((bullet: any) => {
          if (bullet.y < -50) bullet.destroy()
        })

        this.powerUps.children.entries.forEach((powerUp: any) => {
          if (powerUp.y > 650) powerUp.destroy()
        })
      }

      createTutorial() {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x1a472a, 0.9).setDepth(300)
        
        const title = this.add.text(400, 130, '🎄 BattleArena 🎅', {
          fontSize: '52px',
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 6
        }).setOrigin(0.5).setDepth(301)

        const instructions = [
          '← → or A D - Move Santa Left/Right',
          '↑ ↓ or W S - Move Up/Down',
          'SPACE - Throw Snowballs',
          'ESC - Pause',
          '',
          '🎁 Stop the Grinches from stealing Christmas!',
          '⭐ Build combos for bonus joy points',
          '🍬 Collect festive power-ups',
          '🎄 Survive rounds to spread more joy!'
        ]

        const instructionText = this.add.text(400, 290, instructions.join('\n'), {
          fontSize: '20px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          align: 'center',
          lineSpacing: 10
        }).setOrigin(0.5).setDepth(301)

        const startButton = this.add.text(400, 500, '🎅 START THE FUN! 🎄', {
          fontSize: '36px',
          color: '#FFFF00',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 5
        }).setOrigin(0.5).setDepth(301)

        // Pulsing animation
        this.tweens.add({
          targets: startButton,
          scale: { from: 1, to: 1.1 },
          duration: 500,
          yoyo: true,
          repeat: -1
        })

        this.tutorialContainer = this.add.container(0, 0, [overlay, title, instructionText, startButton])

        // Close tutorial on any interaction (click, touch, or keyboard)
        const closeTutorial = () => {
          if (this.tutorialContainer && this.showTutorial) {
            this.tutorialContainer.destroy()
            this.showTutorial = false
          }
        }

        // Listen for pointer/touch
        this.input.once('pointerdown', closeTutorial)

        // Listen for any keyboard press
        if (this.input.keyboard) {
          this.input.keyboard.once('keydown', closeTutorial)
        }
      }

      togglePause() {
        if (this.showTutorial) return
        
        this.isPaused = !this.isPaused

        if (this.isPaused) {
          this.physics.pause()
          this.showPauseMenu()
        } else {
          this.physics.resume()
          this.hidePauseMenu()
        }
      }

      showPauseMenu() {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x1a472a, 0.9)
        const pauseText = this.add.text(400, 180, '⏸️ PAUSED 🎄', {
          fontSize: '68px',
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 7
        }).setOrigin(0.5)

        const stats = [
          `🎄 Christmas Joy: ${this.score}`,
          `🎅 Round: ${this.wave}`,
          `⭐ Combo: ${this.combo}x`,
          `🔥 Best Combo: ${this.bestCombo}x`,
          `🎯 Accuracy: ${this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0}%`
        ]

        const statsText = this.add.text(400, 300, stats.join('\n'), {
          fontSize: '22px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          align: 'center',
          lineSpacing: 8
        }).setOrigin(0.5)

        const resumeButton = this.add.text(400, 430, '▶️ Resume (ESC)', {
          fontSize: '30px',
          color: '#FFFF00',
          fontFamily: 'Arial Black',
          backgroundColor: '#DC143C',
          padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive()

        resumeButton.on('pointerdown', () => this.togglePause())
        resumeButton.on('pointerover', () => resumeButton.setColor('#00FF00'))
        resumeButton.on('pointerout', () => resumeButton.setColor('#FFFF00'))

        const exitButton = this.add.text(400, 510, '🚪 Exit to Menu', {
          fontSize: '24px',
          color: '#FFFFFF',
          fontFamily: 'Arial Black',
          backgroundColor: '#8B0000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive()

        exitButton.on('pointerdown', () => {
          this.gameOver()
        })
        exitButton.on('pointerover', () => exitButton.setColor('#FFD700'))
        exitButton.on('pointerout', () => exitButton.setColor('#FFFFFF'))

        this.pauseMenu = this.add.container(0, 0, [overlay, pauseText, statsText, resumeButton, exitButton])
        this.pauseMenu.setDepth(400)
      }

      hidePauseMenu() {
        if (this.pauseMenu) {
          this.pauseMenu.destroy()
        }
      }

      gameOver() {
        this.physics.pause()
        
        if (this.asteroidSpawnTimer) {
          this.asteroidSpawnTimer.remove()
        }

        // Calculate final stats
        const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0
        
        const stats: GameStats = {
          score: this.score,
          wavesSurvived: this.wave - 1,
          accuracy: accuracy,
          bestCombo: this.bestCombo,
          asteroidsDestroyed: this.totalAsteroidsDestroyed
        }

        // Create game over screen
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x1a472a, 0.95).setDepth(500)
        
        const gameOverText = this.add.text(400, 100, '🎄 CHRISTMAS COMPLETE! 🎅', {
          fontSize: '60px',
          color: '#FFD700',
          fontFamily: 'Arial Black',
          stroke: '#DC143C',
          strokeThickness: 8
        }).setOrigin(0.5).setDepth(501)

        // Animate game over text
        this.tweens.add({
          targets: gameOverText,
          scale: { from: 0.5, to: 1 },
          alpha: { from: 0, to: 1 },
          duration: 500,
          ease: 'Back.out'
        })

        // Display stats
        const statsLines = [
          `🎄 Total Christmas Joy: ${this.score.toLocaleString()}`,
          `🎅 Rounds Survived: ${stats.wavesSurvived}`,
          `🎯 Accuracy: ${accuracy}%`,
          `⭐ Best Combo: ${this.bestCombo}x 🔥`,
          `🎁 Grinches Stopped: ${this.totalAsteroidsDestroyed}`
        ]

        const statsText = this.add.text(400, 280, statsLines.join('\n'), {
          fontSize: '24px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          align: 'center',
          lineSpacing: 12,
          stroke: '#DC143C',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(501).setAlpha(0)

        this.tweens.add({
          targets: statsText,
          alpha: 1,
          delay: 300,
          duration: 500
        })

        // Exit button
        const exitButton = this.add.text(400, 500, '🎁 CONTINUE TO REWARDS', {
          fontSize: '32px',
          color: '#FFFF00',
          fontFamily: 'Arial Black',
          backgroundColor: '#DC143C',
          padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setDepth(501).setInteractive().setAlpha(0)

        this.tweens.add({
          targets: exitButton,
          alpha: 1,
          delay: 600,
          duration: 500
        })

        this.tweens.add({
          targets: exitButton,
          scale: { from: 1, to: 1.05 },
          duration: 800,
          yoyo: true,
          repeat: -1
        })

        exitButton.on('pointerdown', () => {
          onGameOver(this.score, stats)
        })
        exitButton.on('pointerover', () => exitButton.setColor('#00FF00'))
        exitButton.on('pointerout', () => exitButton.setColor('#FFFF00'))
      }
    }

    // Calculate responsive dimensions
    const getGameDimensions = () => {
      const isMobile = window.innerWidth < 768
      const width = isMobile ? Math.min(window.innerWidth - 32, 400) : 800
      const height = isMobile ? Math.min(window.innerHeight * 0.6, 500) : 600
      return { width, height }
    }

    const { width, height } = getGameDimensions()

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: gameRef.current,
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      backgroundColor: '#0d3320',  // Dark Christmas green
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    const newGame = new Phaser.Game(config)
    gameInstanceRef.current = newGame

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true)
        gameInstanceRef.current = null
      }
    }
  }, [onGameOver])

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        ref={gameRef} 
        className="border-4 border-yellow-400 rounded-lg shadow-2xl shadow-yellow-400/50 w-full max-w-[800px]"
      />
      
      <div className="mt-4 text-white text-center max-w-2xl px-4">
        <p className="text-sm md:text-base text-yellow-300 font-bold">
          🎮 Build combos to multiply your score! Collect power-ups to gain advantages!
        </p>
        <p className="text-xs md:text-sm text-gray-300 mt-2">
          💡 Mobile: Touch left/right to move, tap center to shoot!
        </p>
      </div>
    </div>
  )
}
