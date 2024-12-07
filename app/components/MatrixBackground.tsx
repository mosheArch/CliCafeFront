'use client'

import React, { useEffect, useRef } from 'react'

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = canvas.width / 20
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const coffeeSymbols = ['☕', '○', '☕', '☕', '☕', '☕', '☁']

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 5, 0, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#4a2c2a'
      ctx.font = '26px monospace'

      for (let i = 0; i < drops.length; i++) {
        const symbol = coffeeSymbols[Math.floor(Math.random() * coffeeSymbols.length)]
        ctx.fillText(symbol, i * 20, drops[i] * 20)

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
}

export default MatrixBackground

