'use client'
import { useEffect } from 'react'

let ctx: AudioContext | null = null
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as Record<string,typeof AudioContext>).webkitAudioContext)()
  return ctx
}

const note = (freq: number, dur: number, vol = 0.12, type: OscillatorType = 'square', delay = 0) => {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    const t = c.currentTime + delay
    osc.connect(g); g.connect(c.destination)
    osc.type = type; osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t); osc.stop(t + dur + 0.01)
  } catch { /* silent */ }
}

export const playClick  = () => note(1400, 0.025, 0.08, 'square')
export const playBeep   = (f=880, d=0.08, v=0.1) => note(f, d, v, 'sine')
export const playKey    = () => note(900 + Math.random()*400, 0.02, 0.05, 'square')
export const playError  = () => { note(200, 0.3, 0.12, 'sawtooth'); note(150, 0.3, 0.1, 'sawtooth', 0.15) }
export const playSuccess = () => [523,659,784,1047].forEach((f,i)=>note(f,0.18,0.09,'sine',i*0.09))
export const playBoot   = () => [220,330,440,550,660,880].forEach((f,i)=>note(f,0.12,0.08,'square',i*0.1))
export const playAlert  = () => { note(880,0.08,0.1,'square'); note(1100,0.08,0.1,'square',0.12) }
export const playSend   = () => [440,550,660].forEach((f,i)=>note(f,0.1,0.1,'sine',i*0.06))

export const playProcessing = () => {
  let i = 0
  const iv = setInterval(() => {
    note(300 + i * 40, 0.05, 0.04, 'square')
    if (++i > 25) clearInterval(iv)
  }, 220)
  return () => clearInterval(iv)
}

export default function SoundEngine() {
  useEffect(() => {
    const unlock = () => { try { getCtx() } catch {} }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])
  return null
}
