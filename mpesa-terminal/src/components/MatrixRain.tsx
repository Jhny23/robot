'use client'
import { useEffect, useRef } from 'react'

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const W = 18
    const cols = Math.floor(canvas.width / W)
    const drops = Array.from({ length: cols }, () => Math.random() * -80)
    const chars = 'アイウエオカキクケコサシスセソ01234567ABCDEF$@#&*%!?'
    let frame: ReturnType<typeof setInterval>
    frame = setInterval(() => {
      ctx.fillStyle = 'rgba(0,8,0,0.045)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drops.forEach((y, i) => {
        const bright = Math.random() > 0.96
        ctx.font = `${bright ? 'bold ' : ''}12px "Share Tech Mono"`
        ctx.fillStyle = bright ? 'rgba(180,255,180,0.95)' : 'rgba(0,255,65,0.22)'
        ctx.globalAlpha = bright ? 0.9 : 0.25 + Math.random() * 0.2
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * W, y * W)
        if (y * W > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.4
      })
      ctx.globalAlpha = 1
    }, 55)
    return () => { clearInterval(frame); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, opacity:0.15, pointerEvents:'none' }} />
}
