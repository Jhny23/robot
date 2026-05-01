'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBeep, playSuccess, playError, playClick, playProcessing } from './SoundEngine'
import { narrateTransaction, initNarrator } from './NarratorEngine'
import ClassifiedReceipt from './ClassifiedReceipt'
import SimulationMode from './SimulationMode'
import VoiceCommand from './VoiceCommand'

type Stage = 'form' | 'confirm' | 'processing' | 'success' | 'error'

export default function PaymentModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>('form')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [ref, setRef] = useState('')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<{ text: string; type: string }[]>([])
  const [txCode, setTxCode] = useState('')
  const [checkoutId, setCheckoutId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [narratorLine, setNarratorLine] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [showSim, setShowSim] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const stopProc = useRef<(() => void) | null>(null)

  useEffect(() => { initNarrator() }, [])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [logs])

  const addLog = (text: string, type = 'info') =>
    setLogs(p => [...p.slice(-25), { text: `[${new Date().toLocaleTimeString()}] ${text}`, type }])

  // Poll callback
  useEffect(() => {
    if (stage !== 'processing' || !checkoutId) return
    let count = 60
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/callback?id=${checkoutId}`)
        const data = await res.json()
        if (data.found) {
          clearInterval(poll)
          const cb = data.data
          if (cb.ResultCode === 0) {
            const meta = cb.CallbackMetadata?.Item || []
            const receipt = meta.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value || 'SANDBOX_OK'
            setTxCode(receipt)
            setProgress(100)
            addLog('TRANSACTION CONFIRMED ✓', 'success')
            stopProc.current?.()
            playSuccess()
            // Narrate
            const line = narrateTransaction(`KES ${amount}`, phone, true) || ''
            setNarratorLine(line)
            setTimeout(() => setStage('success'), 500)
          } else {
            addLog(`FAILED: ${cb.ResultDesc}`, 'error')
            setErrorMsg(cb.ResultDesc || 'Transaction failed')
            stopProc.current?.()
            playError()
            setTimeout(() => setStage('error'), 500)
          }
        }
      } catch { /* silent */ }
      count--; setCountdown(count)
      if (count <= 0) {
        clearInterval(poll)
        addLog('TIMEOUT: No handset response', 'error')
        setErrorMsg('Request timed out. Please try again.')
        stopProc.current?.()
        playError(); setStage('error')
      }
    }, 1000)
    return () => clearInterval(poll)
  }, [stage, checkoutId, amount, phone])

  const handleConfirm = async () => {
    playClick(); setStage('processing'); setProgress(0); setLogs([])
    const stop = playProcessing()
    stopProc.current = stop
    addLog('INITIATING STK PUSH...'); setProgress(10)
    const prog = setInterval(() => setProgress(p => Math.min(p + 1.5, 82)), 900)
    try {
      addLog('CONNECTING TO DARAJA...'); setProgress(20)
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount, ref })
      })
      const data = await res.json()
      clearInterval(prog)
      if (data.success) {
        setCheckoutId(data.checkoutRequestId)
        setProgress(50)
        addLog(`STK PUSH SENT → ${phone}`, 'success')
        addLog(`CHECKOUT: ${data.checkoutRequestId?.slice(-14)}`)
        addLog('AWAITING PIN ON HANDSET...')
      } else {
        clearInterval(prog); addLog(`API ERROR: ${data.error}`, 'error')
        setErrorMsg(data.error || 'STK push failed')
        stop?.(); playError(); setTimeout(() => setStage('error'), 800)
      }
    } catch (e) {
      clearInterval(prog)
      const msg = e instanceof Error ? e.message : 'Network error'
      addLog(`NETWORK ERROR: ${msg}`, 'error')
      setErrorMsg(msg); stop?.(); playError(); setTimeout(() => setStage('error'), 800)
    }
  }

  const logCol = (t: string) => ({ success: '#00ff41', error: '#ff3300', warn: '#aaff00', info: '#005522' }[t] || '#005522')

  const inputStyle: React.CSSProperties = {
    background: '#000500', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41',
    padding: '10px 12px', fontFamily: "'Share Tech Mono',monospace", fontSize: 14,
    outline: 'none', width: '100%', caretColor: '#00ff41', transition: 'border-color 0.15s'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,4,0,0.92)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        onClick={e => { if (e.target === e.currentTarget) { playClick(); onClose() } }}
      >
        <motion.div
          initial={{ scale: 0.93, y: 16 }} animate={{ scale: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 500, background: '#000d00', border: '1px solid rgba(0,255,65,0.25)', boxShadow: '0 0 80px rgba(0,255,65,0.06)', overflow: 'hidden', fontFamily: "'Share Tech Mono',monospace", position: 'relative' }}
        >
          {/* Scan line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#00ff41,transparent)', animation: 'typewriter 2.5s ease infinite', zIndex: 1 }}/>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, background: '#00ff41', borderRadius: '50%', boxShadow: '0 0 8px #00ff41', animation: 'blink 2s step-end infinite' }}/>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: '#00ff41', textShadow: '0 0 8px #00ff41', letterSpacing: 3 }}>TRANSFER_PROTOCOL</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Voice button */}
              <button onClick={() => { playBeep(880, 0.05); setShowVoice(true) }}
                title="Voice Command"
                style={{ background: 'none', border: '1px solid rgba(0,255,65,0.2)', color: '#007700', padding: '3px 7px', cursor: 'crosshair', fontSize: 11, transition: 'all 0.15s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#00ff41'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#007700'}>
                🎙
              </button>
              <button onClick={() => { playClick(); onClose() }}
                style={{ background: 'none', border: '1px solid #004411', color: '#005522', padding: '3px 8px', cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, transition: 'all 0.15s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#ff3300'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#005522'}>
                [ESC]
              </button>
            </div>
          </div>

          <div style={{ padding: '18px 18px' }}>
            <AnimatePresence mode="wait">

              {/* ── FORM ── */}
              {stage === 'form' && (
                <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 8, color: '#004411', letterSpacing: 3, marginBottom: 4 }}>// RECIPIENT_PHONE</div>
                      <input value={phone} onChange={e => { setPhone(e.target.value); playBeep(900, 0.015, 0.04) }}
                        placeholder="0712 345 678" style={inputStyle}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#00ff41'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,255,65,0.2)'}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, color: '#004411', letterSpacing: 3, marginBottom: 4 }}>// AMOUNT_KES</div>
                      <input value={amount} onChange={e => { setAmount(e.target.value); playBeep(700, 0.015, 0.04) }}
                        placeholder="1000" type="number"
                        style={{ ...inputStyle, fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 700, textShadow: '0 0 8px #00ff41' }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#00ff41'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,255,65,0.2)'}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, color: '#004411', letterSpacing: 3, marginBottom: 4 }}>// REFERENCE_TAG</div>
                      <input value={ref} onChange={e => setRef(e.target.value)} placeholder="RENT / HUSTLE / etc" style={inputStyle}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#00ff41'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(0,255,65,0.2)'}/>
                    </div>

                    {/* Quick amounts */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[100, 500, 1000, 2000, 5000].map(a => (
                        <button key={a} onClick={() => { setAmount(String(a)); playBeep(660, 0.05, 0.09) }}
                          style={{ background: amount === String(a) ? '#00ff41' : 'transparent', border: '1px solid rgba(0,255,65,0.2)', color: amount === String(a) ? '#000a00' : '#006622', padding: '4px 10px', cursor: 'crosshair', fontSize: 9, fontFamily: "'Share Tech Mono',monospace", transition: 'all 0.15s', boxShadow: amount === String(a) ? '0 0 10px #00ff41' : 'none' }}>
                          {a.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Simulation prompt */}
                    {amount && Number(amount) > 0 && (
                      <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => { playBeep(440, 0.08, 0.08); setShowSim(true) }}
                        style={{ background: 'rgba(170,255,0,0.05)', border: '1px solid rgba(170,255,0,0.2)', color: '#aaff00', padding: '7px', cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 2, transition: 'all 0.15s', textAlign: 'center' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(170,255,0,0.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(170,255,0,0.05)'}>
                        ⟳ WHAT IF YOU KEPT KES {Number(amount).toLocaleString()}? RUN SIMULATION →
                      </motion.button>
                    )}

                    <button onClick={() => { if (phone && amount) { playClick(); setStage('confirm') } }}
                      disabled={!phone || !amount}
                      style={{ marginTop: 2, background: 'transparent', border: `2px solid ${phone && amount ? '#00ff41' : '#003300'}`, color: phone && amount ? '#00ff41' : '#004411', padding: 14, fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, letterSpacing: 4, cursor: phone && amount ? 'crosshair' : 'not-allowed', textShadow: phone && amount ? '0 0 10px #00ff41' : 'none', boxShadow: phone && amount ? '0 0 20px rgba(0,255,65,0.15)' : 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { if (phone && amount) { (e.target as HTMLElement).style.background = '#00ff41'; (e.target as HTMLElement).style.color = '#000a00' } }}
                      onMouseLeave={e => { if (phone && amount) { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = '#00ff41' } }}>
                      EXECUTE_TRANSFER →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── CONFIRM ── */}
              {stage === 'confirm' && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)', padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 8, color: '#005522', letterSpacing: 3, marginBottom: 10 }}>// CONFIRM_PAYLOAD</div>
                    {[['TARGET', phone], ['AMOUNT', `KES ${Number(amount).toLocaleString()}`], ['REF', ref || 'NONE'], ['METHOD', 'LIPA NA MPESA STK'], ['FEE', 'KES 0']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(0,255,65,0.06)', fontSize: 11 }}>
                        <span style={{ color: '#005522' }}>{k}</span>
                        <span style={{ color: k === 'AMOUNT' ? '#00ff41' : '#00cc33', fontFamily: k === 'AMOUNT' ? "'Orbitron',monospace" : 'inherit', fontWeight: k === 'AMOUNT' ? 700 : 400, textShadow: k === 'AMOUNT' ? '0 0 6px #00ff41' : 'none' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,51,0,0.08)', border: '1px solid rgba(255,51,0,0.2)', padding: 8, marginBottom: 12, fontSize: 9, color: '#ff6600', textAlign: 'center', letterSpacing: 1 }}>
                    ⚠ STK PUSH → {phone} // ENTER MPESA PIN ON DEVICE
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => { setStage('form'); playClick() }}
                      style={{ background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', color: '#007700', padding: 12, cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2, transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#ff3300'; (e.target as HTMLElement).style.borderColor = 'rgba(255,51,0,0.4)' }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = '#007700'; (e.target as HTMLElement).style.borderColor = 'rgba(0,255,65,0.2)' }}>
                      ← ABORT
                    </button>
                    <button onClick={e => {
                      const btn = e.currentTarget, rect = btn.getBoundingClientRect()
                      const rip = document.createElement('span')
                      rip.style.cssText = `position:absolute;border-radius:50%;background:rgba(0,255,65,0.5);width:200px;height:200px;left:${e.clientX - rect.left - 100}px;top:${e.clientY - rect.top - 100}px;animation:ripple 0.7s linear;pointer-events:none`
                      btn.appendChild(rip); setTimeout(() => rip.remove(), 700)
                      handleConfirm()
                    }}
                      style={{ background: '#00ff41', border: '2px solid #00ff41', color: '#000a00', padding: 12, cursor: 'crosshair', fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, boxShadow: '0 0 25px rgba(0,255,65,0.4)', position: 'relative', overflow: 'hidden' }}>
                      SEND ✓
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── PROCESSING ── */}
              {stage === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    style={{ width: 64, height: 64, border: '2px solid rgba(0,255,65,0.15)', borderTop: '2px solid #00ff41', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: '#00ff41' }}>{progress}%</span>
                  </motion.div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: '#00ff41', letterSpacing: 3, marginBottom: 4 }}>PROCESSING</div>
                  <div style={{ fontSize: 8, color: '#005522', marginBottom: 12 }}>WAITING FOR PIN // {countdown}s</div>
                  <div style={{ height: 3, background: '#001500', marginBottom: 12, borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg,#00ff41,#aaff00)', boxShadow: '0 0 8px #00ff41', borderRadius: 2 }}/>
                  </div>
                  <div ref={logRef} style={{ textAlign: 'left', maxHeight: 140, overflowY: 'auto', background: '#000500', border: '1px solid rgba(0,255,65,0.1)', padding: 10, fontSize: 8 }}>
                    {logs.map((l, i) => <div key={i} style={{ color: logCol(l.type), padding: '1px 0', animation: 'fadeUp 0.15s ease' }}>{l.text}</div>)}
                    <span className="blink" style={{ color: '#00ff41', fontSize: 9 }}>█</span>
                  </div>
                </motion.div>
              )}

              {/* ── SUCCESS ── */}
              {stage === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ fontSize: 58, marginBottom: 8, filter: 'drop-shadow(0 0 20px #00ff41)' }}>✓</motion.div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: '#00ff41', textShadow: '0 0 15px #00ff41', letterSpacing: 4, marginBottom: 4 }}>COMPLETE</div>

                  {/* Narrator line */}
                  {narratorLine && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      style={{ fontSize: 9, color: '#007700', fontStyle: 'italic', margin: '12px 0', padding: '8px 12px', borderLeft: '2px solid rgba(0,255,65,0.3)', textAlign: 'left', lineHeight: 1.6 }}>
                      &ldquo;{narratorLine}&rdquo;
                    </motion.div>
                  )}

                  <div style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)', padding: 12, marginBottom: 12, textAlign: 'left' }}>
                    {[['RECEIPT', txCode || 'SANDBOX_TX'], ['AMOUNT', `KES ${Number(amount).toLocaleString()}`], ['TO', phone], ['TIME', new Date().toLocaleString()], ['STATUS', '✓ CONFIRMED']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 10, borderBottom: '1px solid rgba(0,255,65,0.06)' }}>
                        <span style={{ color: '#005522' }}>{k}</span>
                        <span style={{ color: k === 'STATUS' ? '#00ff41' : k === 'RECEIPT' ? '#aaff00' : '#00cc33' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => { playBeep(660, 0.08); setShowReceipt(true) }}
                      style={{ background: 'rgba(255,51,0,0.08)', border: '1px solid rgba(255,51,0,0.3)', color: '#ff6600', padding: 10, cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 2, transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,51,0,0.15)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,51,0,0.08)'}>
                      ⚠ DOSSIER
                    </button>
                    <button onClick={() => { playClick(); onClose() }}
                      style={{ background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', color: '#007700', padding: 10, cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 2 }}>
                      [CLOSE]
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ERROR ── */}
              {stage === 'error' && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 52, color: '#ff3300', filter: 'drop-shadow(0 0 12px #ff3300)', marginBottom: 8 }}>✗</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: '#ff3300', letterSpacing: 3, marginBottom: 8 }}>FAILED</div>
                  <div style={{ fontSize: 9, color: '#ff6600', background: 'rgba(255,51,0,0.08)', border: '1px solid rgba(255,51,0,0.2)', padding: 10, marginBottom: 12 }}>{errorMsg}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => { setStage('form'); setErrorMsg(''); playClick() }}
                      style={{ background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', color: '#007700', padding: 11, cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2, transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = '#00ff41'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = '#007700'}>
                      ← RETRY
                    </button>
                    <button onClick={() => { playClick(); onClose() }}
                      style={{ background: 'transparent', border: '1px solid rgba(255,51,0,0.3)', color: '#ff3300', padding: 11, cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2 }}>
                      ABORT
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Sub-modals */}
      <AnimatePresence>
        {showReceipt && <ClassifiedReceipt data={{ txCode, amount, phone, ref, timestamp: new Date().toLocaleString(), checkoutId }} onClose={() => setShowReceipt(false)}/>}
        {showSim && <SimulationMode amount={amount} onSend={() => { setShowSim(false) }} onClose={() => setShowSim(false)}/>}
        {showVoice && <VoiceCommand onFill={(p, a, r) => { setPhone(p); setAmount(a); setRef(r) }} onClose={() => setShowVoice(false)}/>}
      </AnimatePresence>
    </>
  )
}
