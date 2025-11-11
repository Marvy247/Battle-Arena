'use client'

import { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'

interface GameProps {
  onGameOver: (score: number) => void
}

export default function PhaserGame({ onGameOver }: GameProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const [game, setGame] = useState<Phaser.Game | null>(null)

  useEffect(() => {
    if (!gameRef.current) return

    class GameScene extends Phaser.Scene {
      private player!: Phaser.Physics.Arcade.Sprite
      private asteroids!: Phaser.Physics.Arcade.Group
      private bullets!: Phaser.Physics.Arcade.Group
      private score = 0
      private scoreText!: Phaser.GameObjects.Text
      private health = 100
      private healthBar!: Phaser.GameObjects.Graphics
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
      private spaceKey!: Phaser.Input.Keyboard.Key
      private escKey!: Phaser.Input.Keyboard.Key
      private lastFired = 0
      private isPaused = false
      private pauseMenu!: Phaser.GameObjects.Container

      preload() {
        // Create simple SVG graphics as base64
        const createPlayerSVG = () => {
          const svg = `
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <polygon points="16,4 24,16 20,28 12,28 8,16" fill="#4FC3F7" stroke="#29B6F6" stroke-width="2"/>
              <circle cx="16" cy="12" r="3" fill="#FFEB3B"/>
            </svg>
          `
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          return URL.createObjectURL(blob)
        }

        const createAsteroidSVG = () => {
          const svg = `
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#78909C" stroke="#546E7A" stroke-width="2"/>
              <circle cx="10" cy="12" r="2" fill="#455A64"/>
              <circle cx="20" cy="8" r="1.5" fill="#455A64"/>
              <circle cx="22" cy="20" r="1" fill="#455A64"/>
            </svg>
          `
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          return URL.createObjectURL(blob)
        }

        const createBulletSVG = () => {
          const svg = `
            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="0" width="4" height="12" fill="#FF5252" rx="2"/>
              <circle cx="8" cy="14" r="2" fill="#FF1744"/>
            </svg>
          `
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          return URL.createObjectURL(blob)
        }

        this.load.image('player', createPlayerSVG())
        this.load.image('asteroid', createAsteroidSVG())
        this.load.image('bullet', createBulletSVG())
      }

      create() {
        // Create starry background
        this.createStars()

        // Create player
        this.player = this.physics.add.sprite(400, 500, 'player')
        this.player.setCollideWorldBounds(true)
        this.player.setScale(1.2)

        // Create object groups
        this.asteroids = this.physics.add.group()
        this.bullets = this.physics.add.group()

        // Create UI
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
          fontSize: '28px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 4
        })

        this.healthBar = this.add.graphics()
        this.updateHealthBar()

        // Setup controls
        this.cursors = this.input.keyboard!.createCursorKeys()
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

        // Setup ESC key for pause
        this.escKey.on('down', this.togglePause, this)

        // Spawn asteroids
        this.time.addEvent({
          delay: 800,
          callback: this.spawnAsteroid,
          callbackScope: this,
          loop: true
        })

        // Setup collisions
        this.physics.add.collider(this.player, this.asteroids, this.hitAsteroid, undefined, this)
        this.physics.add.collider(this.bullets, this.asteroids, this.destroyAsteroid, undefined, this)

        // Add some initial asteroids
        for (let i = 0; i < 5; i++) {
          this.spawnAsteroid()
        }
      }

      createStars() {
        // Create simple star background
        for (let i = 0; i < 50; i++) {
          const star = this.add.circle(
            Phaser.Math.Between(0, 800),
            Phaser.Math.Between(0, 600),
            Phaser.Math.FloatBetween(0.5, 2),
            0xFFFFFF,
            Phaser.Math.FloatBetween(0.3, 0.8)
          )
        }
      }

      update(time: number) {
        if (this.isPaused) return

        // Player movement
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-300)
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(300)
        } else {
          this.player.setVelocityX(0)
        }

        // Shooting with cooldown
        if (this.spaceKey.isDown && time > this.lastFired) {
          this.shootBullet()
          this.lastFired = time + 150 // 150ms cooldown
        }

        // Rotate player slightly when moving
        this.player.rotation = this.player.body!.velocity.x * 0.0005

        // Cleanup off-screen objects
        this.cleanupObjects()
      }

      cleanupObjects() {
        // Remove asteroids that have gone off screen
        this.asteroids.children.entries.forEach((asteroid: any) => {
          if (asteroid.y > 650) {
            asteroid.destroy()
          }
        })

        // Remove bullets that have gone off screen
        this.bullets.children.entries.forEach((bullet: any) => {
          if (bullet.y < -50) {
            bullet.destroy()
          }
        })
      }

      spawnAsteroid() {
        const x = Phaser.Math.Between(50, 750)
        const asteroid = this.asteroids.create(x, -50, 'asteroid')
        
        asteroid.setVelocityY(Phaser.Math.Between(100, 200))
        asteroid.setAngularVelocity(Phaser.Math.Between(-30, 30))
        asteroid.setScale(Phaser.Math.FloatBetween(0.8, 1.5))

        // Remove asteroid when it goes off screen
        this.time.delayedCall(10000, () => {
          if (asteroid.active) asteroid.destroy()
        })
      }

      shootBullet() {
        const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet')
        bullet.setVelocityY(-500)
        
        // Add bullet trail effect
        this.tweens.add({
          targets: bullet,
          alpha: { from: 1, to: 0.3 },
          duration: 400,
          onComplete: () => bullet.destroy()
        })

        // Auto-destroy bullet after 2 seconds
        this.time.delayedCall(2000, () => {
          if (bullet.active) bullet.destroy()
        })
      }

      updateHealthBar() {
        this.healthBar.clear()
        
        // Background
        this.healthBar.fillStyle(0x000000, 0.5)
        this.healthBar.fillRect(20, 60, 200, 20)
        
        // Health
        this.healthBar.fillStyle(0x00FF00, 1)
        this.healthBar.fillRect(20, 60, (this.health / 100) * 200, 20)
        
        // Border
        this.healthBar.lineStyle(2, 0xFFFFFF)
        this.healthBar.strokeRect(20, 60, 200, 20)
      }

      hitAsteroid(player: any, asteroid: any) {
        this.health -= 20
        this.updateHealthBar()

        // Screen shake effect
        this.cameras.main.shake(100, 0.01)

        // Explosion effect
        this.createExplosion(asteroid.x, asteroid.y)
        asteroid.destroy()

        if (this.health <= 0) {
          this.gameOver()
        }
      }

      destroyAsteroid(bullet: any, asteroid: any) {
        this.score += 10
        this.scoreText.setText('SCORE: ' + this.score)

        // Explosion effect
        this.createExplosion(asteroid.x, asteroid.y)

        bullet.destroy()
        asteroid.destroy()

        // Occasionally spawn power-up (health)
        if (Phaser.Math.Between(1, 5) === 1) {
          this.spawnHealthPowerUp(asteroid.x, asteroid.y)
        }
      }

      createExplosion(x: number, y: number) {
        // Simple explosion using particles
        for (let i = 0; i < 8; i++) {
          const particle = this.add.circle(x, y, Phaser.Math.Between(2, 6), 0xFFA500)
          
          this.tweens.add({
            targets: particle,
            x: x + Phaser.Math.Between(-50, 50),
            y: y + Phaser.Math.Between(-50, 50),
            alpha: 0,
            scale: 0,
            duration: 500,
            onComplete: () => particle.destroy()
          })
        }
      }

      spawnHealthPowerUp(x: number, y: number) {
        const powerUp = this.physics.add.sprite(x, y, 'asteroid')
        powerUp.setScale(0.5)
        powerUp.setTint(0x00FF00)
        powerUp.setVelocityY(100)

        // Pulsing effect
        this.tweens.add({
          targets: powerUp,
          scale: { from: 0.5, to: 0.75 },
          duration: 400,
          yoyo: true,
          repeat: -1
        })

        // Check collision with player
        this.physics.add.overlap(this.player, powerUp, () => {
          this.health = Math.min(100, this.health + 30)
          this.updateHealthBar()

          // Healing effect
          this.cameras.main.flash(200, 0, 255, 0, true)
          powerUp.destroy()
        })

        // Auto-destroy after 5 seconds
        this.time.delayedCall(5000, () => {
          if (powerUp.active) powerUp.destroy()
        })
      }

      togglePause() {
        this.isPaused = !this.isPaused

        if (this.isPaused) {
          this.showPauseMenu()
        } else {
          this.hidePauseMenu()
        }
      }

      showPauseMenu() {
        // Create semi-transparent overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)

        // Pause text
        const pauseText = this.add.text(400, 200, 'PAUSED', {
          fontSize: '48px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5)

        // Resume button
        const resumeButton = this.add.text(400, 300, 'Resume (ESC)', {
          fontSize: '24px',
          color: '#00FF00',
          fontFamily: 'Arial',
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive()

        resumeButton.on('pointerdown', () => {
          this.togglePause()
        })

        resumeButton.on('pointerover', () => {
          resumeButton.setColor('#FFFF00')
        })

        resumeButton.on('pointerout', () => {
          resumeButton.setColor('#00FF00')
        })

        // Restart button
        const restartButton = this.add.text(400, 350, 'Restart Game', {
          fontSize: '24px',
          color: '#FFFF00',
          fontFamily: 'Arial',
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive()

        restartButton.on('pointerdown', () => {
          this.scene.restart()
        })

        restartButton.on('pointerover', () => {
          restartButton.setColor('#FFFFFF')
        })

        restartButton.on('pointerout', () => {
          restartButton.setColor('#FFFF00')
        })

        // Exit button
        const exitButton = this.add.text(400, 400, 'Exit to Menu', {
          fontSize: '24px',
          color: '#FF0000',
          fontFamily: 'Arial',
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive()

        exitButton.on('pointerdown', () => {
          onGameOver(this.score)
        })

        exitButton.on('pointerover', () => {
          exitButton.setColor('#FF6666')
        })

        exitButton.on('pointerout', () => {
          exitButton.setColor('#FF0000')
        })

        // Store pause menu elements
        this.pauseMenu = this.add.container(0, 0, [overlay, pauseText, resumeButton, restartButton, exitButton])
      }

      hidePauseMenu() {
        if (this.pauseMenu) {
          this.pauseMenu.destroy()
        }
      }

      gameOver() {
        this.physics.pause()

        // Game over text
        this.add.text(400, 250, 'GAME OVER', {
          fontSize: '64px',
          color: '#FF0000',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 6
        }).setOrigin(0.5)

        this.add.text(400, 320, `Final Score: ${this.score}`, {
          fontSize: '32px',
          color: '#FFFFFF',
          fontFamily: 'Arial'
        }).setOrigin(0.5)

        this.add.text(400, 370, 'Click to restart', {
          fontSize: '20px',
          color: '#AAAAAA',
          fontFamily: 'Arial'
        }).setOrigin(0.5)

        // Restart on click
        this.input.once('pointerdown', () => {
          onGameOver(this.score)
        })
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }
        }
      },
      backgroundColor: '#0a0a2a'
    }

    const newGame = new Phaser.Game(config)
    setGame(newGame)

    return () => {
      newGame.destroy(true)
    }
  }, [onGameOver])

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={gameRef} 
        className="border-4 border-blue-500 rounded-lg shadow-2xl"
      />
      
      <div className="mt-4 text-white text-center">
        <p className="text-lg mb-2">← → to move | SPACE to shoot | ESC to pause</p>
        <p className="text-sm text-gray-400">Destroy asteroids and avoid getting hit!</p>
      </div>
    </div>
  )
}