import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      initStars()
    }

    function initStars() {
      const count = Math.floor((canvas!.width * canvas!.height) / 8000)
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const star of starsRef.current) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
        const opacity = star.opacity + twinkle * 0.15
        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(232, 232, 255, ${Math.max(0.05, opacity)})`
        ctx!.fill()
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    resize()
    animFrameRef.current = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
