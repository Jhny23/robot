'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBeep, playClick, playError, playAlert } from './SoundEngine'

interface ParsedCommand {
  phone?: string
  amount?: string
  ref?: string
}

function parseCommand(text: string): ParsedCommand {
  const lower = text.toLowerCase().replace(/,/g, '')
  const result: ParsedCommand = {}

  // Amount: "send five hundred" / "send 500" / "five thousand"
  const numWords: Record<string, number> = {
    'zero':0,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10,
    'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,'nineteen':19,
    'twenty':20,'thirty':30,'forty':40,'fifty':50,'sixty':60,'seventy':70,'eighty':80,'ninety':90,
    'hundred':100,'thousand':1000,'million':1000000
  }
  // Try to find digits first
  const digitMatch = lower.match(/\b(\d{3,6})\b/)
  if (digitMatch) result.amount = digitMatch[1]
  else {
    // Parse word numbers
    let total = 0, current = 0
    lower.split(/\s+/).forEach(w => {
      const n = numWords[w]
      if (n !== undefined) {
        if (n === 100) current *= n
        else if (n >= 1000) { total = (total + current) * n; current = 0 }
        else current += n
      }
    })
    const wordAmount = total + current
    if (wordAmount > 0) result.amount = String(wordAmount)
  }

  // Phone number: "zero seven..." or digits
  const phoneMatch = lower.match(/\b(0[17]\d{8}|07\d{8}|01\d{8})\b/) ||
    lower.match(/zero\s+seven\s+(\d[\s\d]{6,9})/)
  if (phoneMatch) result.phone = phoneMatch[0].replace(/\s/g, '').replace('zero','0').replace('seven','7')

  // Reference
  const refMatch = lower.match(/(?:reference|ref|for)\s+([a-z_\s]+?)(?:\s|$)/i)
  if (refMatch) result.ref = refMatch[1].trim().toUpperCase().replace(/\s+/g, '_')

  return result
}

export default function VoiceCommand({ onFill, onClose }: {
  onFill: (phone: string, amount: string, ref: string) => void
  onClose: () => void
}) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedCommand>({})
  const [status, setStatus] = useState<'idle'|'listening'|'processing'|'done'|'error'>('idle')
  const [waveH, setWaveH] = useState<number[]>(Array.from({length:24},()=>8))
  const [supported, setSupported] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const waveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { setSupported(false); return }
    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-KE'
    recognitionRef.current = rec

    rec.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
      if (e.results[0].isFinal) {
        setStatus('processing')
        playBeep(880, 0.1, 0.1)
        const p = parseCommand(t)
        setParsed(p)
        setTimeout(() => setStatus('done'), 600)
      }
    }
    rec.onerror = (_e: any) => { setStatus('error'); playError(); stopListening() }
    rec.onend = () => { setListening(false); clearInterval(waveRef.current) }
    return () => rec.abort()
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript(''); setParsed({}); setStatus('listening')
    setListening(true)
    playAlert()
    recognitionRef.current.start()
    waveRef.current = setInterval(() => {
      setWaveH(Array.from({length:24},()=>4+Math.random()*40))
    }, 80)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    clearInterval(waveRef.current)
    setListening(false)
  }, [])

  const handleConfirm = () => {
    if (parsed.phone && parsed.amount) {
      playBeep(660, 0.12, 0.1)
      onFill(parsed.phone, parsed.amount, parsed.ref || '')
      onClose()
    }
  }

  const HINTS = [
    '"SEND 500 TO 0712345678"',
    '"SEND TWO THOUSAND TO 0722..."',
    '"SEND 1000 TO 07... REFERENCE RENT"',
  ]

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, zIndex:1500, background:'rgba(0,4,0,0.97)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
        style={{ width:'100%', maxWidth:420, background:'#000d00', border:'1px solid rgba(0,255,65,0.25)', fontFamily:"'Share Tech Mono',monospace", overflow:'hidden' }}
      >
        <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(0,255,65,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:'#00ff41', letterSpacing:3, textShadow:'0 0 8px #00ff41' }}>VOICE_COMMAND</span>
          <button onClick={onClose} style={{ background:'none', border:'1px solid #005522', color:'#005522', padding:'3px 8px', cursor:'crosshair', fontSize:9, fontFamily:"'Share Tech Mono',monospace" }}>[ESC]</button>
        </div>

        <div style={{ padding:20 }}>
          {!supported ? (
            <div style={{ textAlign:'center', color:'#ff3300', fontSize:11, padding:20 }}>
              SPEECH API NOT SUPPORTED IN THIS BROWSER.<br/>
              <span style={{ fontSize:8, color:'#005522', display:'block', marginTop:8 }}>TRY CHROME OR EDGE.</span>
            </div>
          ) : (
            <>
              {/* Mic button */}
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ position:'relative', display:'inline-block' }}>
                  {listening && (
                    <>
                      <motion.div animate={{ scale:[1,1.5,1], opacity:[0.4,0,0.4] }} transition={{ repeat:Infinity, duration:1.2 }}
                        style={{ position:'absolute', inset:-16, borderRadius:'50%', border:'1px solid #00ff41', pointerEvents:'none' }}/>
                      <motion.div animate={{ scale:[1,1.8,1], opacity:[0.2,0,0.2] }} transition={{ repeat:Infinity, duration:1.2, delay:0.3 }}
                        style={{ position:'absolute', inset:-28, borderRadius:'50%', border:'1px solid #00ff41', pointerEvents:'none' }}/>
                    </>
                  )}
                  <button
                    onClick={listening ? stopListening : startListening}
                    style={{
                      width:72, height:72, borderRadius:'50%',
                      background: listening ? 'rgba(255,51,0,0.15)' : 'rgba(0,255,65,0.08)',
                      border: `2px solid ${listening ? '#ff3300' : '#00ff41'}`,
                      color: listening ? '#ff3300' : '#00ff41',
                      fontSize:28, cursor:'crosshair',
                      boxShadow: listening ? '0 0 30px rgba(255,51,0,0.3)' : '0 0 15px rgba(0,255,65,0.15)',
                      transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center',
                    }}
                  >
                    {listening ? '◼' : '🎙'}
                  </button>
                </div>
                <div style={{ fontSize:8, color:'#005522', marginTop:10, letterSpacing:2 }}>
                  {status === 'idle' && 'PRESS TO SPEAK'}
                  {status === 'listening' && <span style={{ color:'#ff3300' }}>LISTENING... SPEAK NOW</span>}
                  {status === 'processing' && <span style={{ color:'#aaff00' }}>PARSING COMMAND...</span>}
                  {status === 'done' && <span style={{ color:'#00ff41' }}>COMMAND PARSED ✓</span>}
                  {status === 'error' && <span style={{ color:'#ff3300' }}>ERROR — TRY AGAIN</span>}
                </div>
              </div>

              {/* Waveform */}
              {listening && (
                <div style={{ display:'flex', alignItems:'center', gap:2, height:40, marginBottom:14, padding:'0 10px' }}>
                  {waveH.map((h,i) => (
                    <div key={i} style={{ flex:1, height:h+'px', background:'#ff3300', borderRadius:1, boxShadow:'0 0 3px #ff330088', transition:'height 0.08s ease' }}/>
                  ))}
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div style={{ background:'rgba(0,255,65,0.04)', border:'1px solid rgba(0,255,65,0.12)', padding:'10px 12px', marginBottom:12, fontSize:11, color:'#00cc33', lineHeight:1.5, minHeight:40 }}>
                  &ldquo;{transcript}&rdquo;
                </div>
              )}

              {/* Parsed result */}
              {status === 'done' && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:8, color:'#005522', letterSpacing:2, marginBottom:6 }}>// PARSED_PAYLOAD</div>
                  {[
                    ['PHONE', parsed.phone || '⚠ NOT DETECTED'],
                    ['AMOUNT', parsed.amount ? `KES ${parsed.amount}` : '⚠ NOT DETECTED'],
                    ['REFERENCE', parsed.ref || 'NONE'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid rgba(0,255,65,0.06)', fontSize:10 }}>
                      <span style={{ color:'#004411' }}>{k}</span>
                      <span style={{ color: v.includes('⚠') ? '#ff6600' : '#00ff41' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
                    <button onClick={startListening} style={{ background:'transparent', border:'1px solid rgba(0,255,65,0.2)', color:'#007700', padding:10, cursor:'crosshair', fontSize:9, fontFamily:"'Share Tech Mono',monospace", letterSpacing:2, transition:'all 0.15s' }}
                      onMouseEnter={e=>(e.target as HTMLElement).style.color='#00ff41'}
                      onMouseLeave={e=>(e.target as HTMLElement).style.color='#007700'}>
                      ↺ RETRY
                    </button>
                    <button onClick={handleConfirm} disabled={!parsed.phone || !parsed.amount}
                      style={{ background: parsed.phone&&parsed.amount ? '#00ff41' : 'transparent', border:'1px solid rgba(0,255,65,0.3)', color: parsed.phone&&parsed.amount ? '#000a00' : '#004411', padding:10, cursor: parsed.phone&&parsed.amount ? 'crosshair':'not-allowed', fontSize:9, fontFamily:"'Orbitron',monospace", fontWeight:700, letterSpacing:2, transition:'all 0.15s' }}>
                      FILL FORM ✓
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Hints */}
              {status === 'idle' && (
                <div style={{ borderTop:'1px solid rgba(0,255,65,0.06)', paddingTop:12 }}>
                  <div style={{ fontSize:7, color:'#004411', letterSpacing:2, marginBottom:6 }}>// EXAMPLES</div>
                  {HINTS.map(h => (
                    <div key={h} style={{ fontSize:8, color:'#005522', padding:'2px 0' }}>{h}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
