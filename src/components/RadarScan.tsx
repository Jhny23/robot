'use client'
import { useEffect, useRef } from 'react'

const BLIPS = [
  { x: 0.28, y: -0.52 }, { x: -0.61, y: 0.18 },
  { x: 0.72, y: 0.43 }, { x: -0.22, y: 0.68 },
  { x: 0.08, y: -0.31 }, { x: -0.45, y: -0.6 },
]

export default function RadarScan({ size = 200 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = size; canvas.height = size
    const cx = size / 2, cy = size / 2, r = size / 2 - 6
    let angle = 0
    const blipAges = BLIPS.map(() => Math.floor(Math.random() * 60))
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // BG
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      bgGrad.addColorStop(0, 'rgba(0,30,8,0.97)')
      bgGrad.addColorStop(1, 'rgba(0,10,2,0.97)')
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = bgGrad; ctx.fill()

      // Rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, r * (i / 4), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,255,65,${0.06 + i * 0.04})`
        ctx.lineWidth = 0.5; ctx.stroke()
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(0,255,65,0.1)'; ctx.lineWidth = 0.5
      for (let a = 0; a < 360; a += 45) {
        const rad = (a - 90) * Math.PI / 180
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad))
        ctx.stroke()
      }

      // Degree labels
      ctx.fillStyle = 'rgba(0,255,65,0.45)'; ctx.font = '5.5px "Share Tech Mono"'
      for (let d = 0; d < 360; d += 30) {
        const rad = (d - 90) * Math.PI / 180
        const tx = cx + (r - 11) * Math.cos(rad)
        const ty = cy + (r - 11) * Math.sin(rad)
        ctx.fillText(String(d).padStart(3, '0'), tx - 7, ty + 2)
      }

      // Sweep trail
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 0.55
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, r, -Math.PI / 2 - a, -Math.PI / 2 - a + 0.04)
        ctx.strokeStyle = `rgba(0,255,65,${0.0 + i * 0.006})`
        ctx.lineWidth = 2; ctx.stroke()
      }
      // Sweep line
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r)
      ctx.strokeStyle = 'rgba(0,255,65,0.95)'; ctx.lineWidth = 1.5; ctx.stroke()
      // Tip glow
      ctx.beginPath(); ctx.arc(0, -r + 2, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#00ff41'; ctx.fill()
      ctx.restore()

      // Blips
      BLIPS.forEach((b, i) => {
        const bAngle = (Math.atan2(b.x, -b.y) + Math.PI * 2) % (Math.PI * 2)
        const normalAngle = (angle + Math.PI * 2) % (Math.PI * 2)
        const diff = ((bAngle - normalAngle) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.06) blipAges[i] = 0
        blipAges[i]++

        const alpha = Math.max(0, 1 - blipAges[i] / 70)
        if (alpha > 0.05) {
          const bx = cx + b.x * r * 0.9
          const by = cy + b.y * r * 0.9
          ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,255,65,${alpha})`; ctx.fill()
          ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,255,65,${alpha * 0.3})`; ctx.lineWidth = 1; ctx.stroke()
        }
      })

      // Border ring
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,255,65,0.55)'; ctx.lineWidth = 1.5; ctx.stroke()

      angle = (angle + 0.022) % (Math.PI * 2)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [size])

  return <canvas ref={ref} style={{ width: size, height: size, borderRadius: '50%', display: 'block' }} />
}
