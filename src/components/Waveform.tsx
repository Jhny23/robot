'use client'
import { useEffect, useRef } from 'react'

export default function Waveform({ color = '#00ff41', height = 40, bars = 32 }: { color?: string; height?: number; bars?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const els = Array.from(ref.current.querySelectorAll<HTMLDivElement>('.wb'))
    const timers: ReturnType<typeof setTimeout>[] = []
    els.forEach((el, i) => {
      const run = () => {
        el.style.height = (12 + Math.random() * 88) + '%'
        timers.push(setTimeout(run, 80 + Math.random() * 280))
      }
      timers.push(setTimeout(run, i * 25))
    })
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div ref={ref} style={{ display:'flex', alignItems:'center', gap:'2px', height: height+'px', width:'100%' }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="wb" style={{
          flex: 1, height: '35%', background: color,
          transition: 'height 0.12s ease',
          boxShadow: `0 0 3px ${color}66`,
          borderRadius: '1px',
        }} />
      ))}
    </div>
  )
}
