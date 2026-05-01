'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MatrixRain from '@/components/MatrixRain'
import RadarScan from '@/components/RadarScan'
import TerminalLog from '@/components/TerminalLog'
import PaymentModal from '@/components/PaymentModal'
import StatusBar from '@/components/StatusBar'
import ProfilePanel from '@/components/ProfilePanel'
import DataGrid from '@/components/DataGrid'
import SoundEngine, { playBoot, playClick, playBeep, playAlert } from '@/components/SoundEngine'
import MoneyGlobe from '@/components/MoneyGlobe'
import TxTimeline from '@/components/TxTimeline'
import { initNarrator } from '@/components/NarratorEngine'

// ─────────────────────────────────────────────
// BOOT SCREEN
// ─────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'lines'|'flash'|'done'>('lines')

  const BOOT = [
    '> BIOS POST CHECK................ [PASS]',
    '> LOADING KERNEL v5.15.0-LTS...... [OK]',
    '> MOUNTING ROOT FS /dev/sda1...... [OK]',
    '> SPAWNING INIT PID 1............. [OK]',
    '> NET INTERFACE eth0 UP........... [OK]',
    '> RESOLVING api.safaricom.co.ke... [OK]',
    '> TLS 1.3 HANDSHAKE............... [OK]',
    '> CONSUMER KEY HMAC VERIFY........ [OK]',
    '> OAUTH2 ACCESS TOKEN ISSUED...... [OK]',
    '> AES-256-GCM CIPHER ARMED........ [OK]',
    '> DARAJA STK ENDPOINT READY....... [OK]',
    '> RADAR SUBSYSTEM ONLINE.......... [OK]',
    '> SIMULATION LOADED. WELCOME, HEISENBERG.',
  ]

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      if (i < BOOT.length) {
        setLines(p => [...p, BOOT[i]])
        setProgress(Math.round(((i + 1) / BOOT.length) * 100))
        i++
      } else {
        clearInterval(iv)
        playBoot()
        setTimeout(() => setPhase('flash'), 400)
        setTimeout(() => { setPhase('done'); onDone() }, 900)
      }
    }, 200)
    return () => clearInterval(iv)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'flash' ? [1, 0, 1, 0, 1, 0] : 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#000a00', padding:20, position:'relative', overflow:'hidden' }}
    >
      {/* Moving grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,65,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px', animation:'gridMove 5s linear infinite' }}/>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:600 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6 }}
          style={{ textAlign:'center', marginBottom:32 }}
        >
          <div style={{ fontFamily:"'VT323',monospace", fontSize:88, color:'#00ff41', letterSpacing:14, lineHeight:1, textShadow:'0 0 20px #00ff41,0 0 60px #00ff4144', animation:'flicker 5s infinite' }}>
            MR ROBOT
          </div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:8, color:'#005522', marginTop:4 }}>
            SECURE TRANSACTION TERMINAL // SIMULATION v2.4
          </div>
        </motion.div>

        {/* Terminal box */}
        <div style={{ background:'rgba(0,12,3,0.95)', border:'1px solid rgba(0,255,65,0.25)', padding:16, minHeight:220, position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00ff41,transparent)', animation:'typewriter 2.5s ease infinite' }}/>
          {lines.map((l, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-8 }}
              animate={{ opacity:1, x:0 }}
              transition={{ duration:0.15 }}
              style={{
                fontFamily:"'Share Tech Mono',monospace", fontSize:11,
                color: i===lines.length-1 ? '#00ff41' : 'rgba(0,200,50,0.5)',
                padding:'2px 0',
                textShadow: i===lines.length-1 ? '0 0 8px #00ff41' : 'none',
              }}
            >{l}</motion.div>
          ))}
          {lines.length < BOOT.length && <span className="blink" style={{ color:'#00ff41', fontSize:12 }}>█</span>}
        </div>

        {/* Progress */}
        <div style={{ marginTop:10 }}>
          <div style={{ height:2, background:'#001a00', borderRadius:1, overflow:'hidden' }}>
            <motion.div
              style={{ height:'100%', background:'linear-gradient(90deg,#00ff41,#aaff00)', boxShadow:'0 0 10px #00ff41' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration:0.2 }}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:8, color:'#007700', fontFamily:"'Share Tech Mono',monospace" }}>
            <span>LOADING MODULES</span><span>{progress}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// BALANCE PANEL
// ─────────────────────────────────────────────
function BalancePanel() {
  const [balance, setBalance] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const TARGET = 847293

  useEffect(() => {
    let cur = 0
    const iv = setInterval(() => {
      cur = Math.min(cur + Math.ceil((TARGET - cur) / 16), TARGET)
      setBalance(cur)
      if (cur >= TARGET) clearInterval(iv)
    }, 35)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 150)
      }
    }, 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div className="panel"
      initial={{ opacity:0, x:-20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:0.3, duration:0.5 }}
    >
      <div className="panel-header"><span>WALLET_BALANCE</span><span style={{ color:'#00ff41', fontSize:7 }}>▶ LIVE</span></div>
      <div style={{ padding:12 }}>
        <motion.div
          animate={{ filter: glitch ? ['brightness(1)','brightness(2)','brightness(0.5)','brightness(1)'] : 'brightness(1)' }}
          transition={{ duration:0.15 }}
        >
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900, color:'#00ff41', textShadow:'0 0 15px #00ff41,0 0 40px #00ff4166', lineHeight:1 }}>
            KES {balance.toLocaleString()}
          </div>
        </motion.div>
        <div style={{ fontSize:8, color:'#005522', marginTop:3 }}>
          ≡ USD {(balance*0.0077).toFixed(2)} &nbsp;|&nbsp; ETH {(balance*0.0000025).toFixed(6)}
        </div>
        <div style={{ marginTop:10, height:3, background:'#001a00', borderRadius:2 }}>
          <motion.div
            initial={{ width:'0%' }}
            animate={{ width:'73%' }}
            transition={{ delay:0.8, duration:1.2, ease:'easeOut' }}
            style={{ height:'100%', background:'linear-gradient(90deg,#00ff41,#aaff00)', boxShadow:'0 0 8px #00ff41', borderRadius:2 }}
          />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:7, color:'#004411', marginTop:3 }}>
          <span>HEAP_LIMIT: KES 1.2M</span><span>73% ALLOCATED</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// RECENT TX
// ─────────────────────────────────────────────
function RecentTx() {
  const TXS = [
    { id:'QK8X2B', type:'RECV', amount:'+12,500', from:'CAROL_M', t:'09:12:44', hash:'0xA3F2' },
    { id:'PL9Y4A', type:'SEND', amount:'-5,000',  from:'UNCLE_K', t:'08:44:11', hash:'0xB7C1' },
    { id:'MN3Z1C', type:'RECV', amount:'+3,200',  from:'FREELANCE_X', t:'07:30:05', hash:'0xD4E8' },
    { id:'RQ7W8D', type:'SEND', amount:'-800',    from:'NAIVAS_POS', t:'YST 23:10', hash:'0xF1A9' },
  ]
  return (
    <motion.div className="panel"
      initial={{ opacity:0, x:-20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:0.5, duration:0.5 }}
    >
      <div className="panel-header">
        <span>TX_LEDGER</span>
        <span className="blink" style={{ color:'#00ff41', fontSize:7 }}>● MEMPOOL</span>
      </div>
      <div style={{ padding:'6px 10px' }}>
        {TXS.map((tx, i) => (
          <motion.div key={tx.id}
            initial={{ opacity:0, x:-10 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay: 0.6 + i*0.08 }}
            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(0,255,65,0.06)' }}
          >
            <div>
              <div style={{ fontSize:11, color:tx.type==='RECV'?'#00ff41':'#ff6600', fontWeight:700 }}>{tx.amount}</div>
              <div style={{ fontSize:7, color:'#005522' }}>{tx.from} // {tx.hash}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:7, color:'#008822' }}>{tx.id}</div>
              <div style={{ fontSize:7, color:'#004411' }}>{tx.t}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// HP PANEL
// ─────────────────────────────────────────────
function StatusBars() {
  const bars = [
    { l:'INTEGRITY', v:'175/225', pct:78, color:'#00ff41' },
    { l:'AUTH_LVL',  v:'6/10',   pct:60, color:'#aaff00' },
    { l:'BANDWIDTH', v:'90/90',  pct:100, color:'#00ffff' },
  ]
  return (
    <motion.div className="panel"
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:0.7 }}
    >
      <div className="panel-header"><span>PROCESS_STATUS</span></div>
      <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:5 }}>
        {bars.map((b, i) => (
          <div key={b.l}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:7, marginBottom:2 }}>
              <span style={{ color:'#005522' }}>{b.l}</span>
              <span style={{ color:b.color, fontFamily:"'Orbitron',monospace", fontSize:7 }}>{b.v}</span>
            </div>
            <div style={{ height:3, background:'#001a00', borderRadius:2 }}>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${b.pct}%` }}
                transition={{ delay: 0.8 + i*0.15, duration:0.9, ease:'easeOut' }}
                style={{ height:'100%', background:b.color, boxShadow:`0 0 6px ${b.color}88`, borderRadius:2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// HERO PANEL
// ─────────────────────────────────────────────
function HeroPanel({ onSend, onTimeline }: { onSend: () => void; onTimeline: () => void }) {
  const [hover, setHover] = useState(false)
  const [ripples, setRipples] = useState<{id:number;x:number;y:number}[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rip = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }
    setRipples(p => [...p, rip])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== rip.id)), 700)
    playSend()
    onSend()
  }

  const playSend = () => {
    [440, 550, 660].forEach((f, i) => setTimeout(() => playBeep(f, 0.12, 0.09), i * 60))
  }

  return (
    <motion.div className="panel"
      initial={{ opacity:0, scale:0.96 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ delay:0.2, duration:0.5 }}
      style={{ padding:'28px 20px', textAlign:'center', position:'relative', overflow:'hidden', border:'1px solid rgba(0,255,65,0.25)', boxShadow:'0 0 40px rgba(0,255,65,0.06),inset 0 0 40px rgba(0,255,65,0.02)' }}
    >
      {/* Animated corner brackets */}
      {['tl','tr','bl','br'].map(c => (
        <div key={c} style={{
          position:'absolute', width:16, height:16,
          top:c.startsWith('t')?8:'auto', bottom:c.startsWith('b')?8:'auto',
          left:c.endsWith('l')?8:'auto', right:c.endsWith('r')?8:'auto',
          borderTop:c.startsWith('t')?'1px solid #00ff41':'none',
          borderBottom:c.startsWith('b')?'1px solid #00ff41':'none',
          borderLeft:c.endsWith('l')?'1px solid #00ff41':'none',
          borderRight:c.endsWith('r')?'1px solid #00ff41':'none',
        }}/>
      ))}

      {/* Top scan */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00ff41,transparent)', animation:'typewriter 3s ease infinite' }}/>

      {/* Title */}
      <motion.div
        animate={{ textShadow: hover ? '0 0 25px #00ff41, 0 0 60px #00ff41' : '0 0 15px #00ff41, 0 0 35px #00ff4166' }}
        style={{ fontFamily:"'VT323',monospace", fontSize:70, letterSpacing:12, color:'#00ff41', lineHeight:1, marginBottom:4, animation:'flicker 6s infinite' }}
      >
        MR ROBOT
      </motion.div>

      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:6, color:'#005522', marginBottom:20 }}>
        SECURE PAYMENT TERMINAL
      </div>

      {/* Simulation text */}
      <div style={{ fontSize:8, color:'rgba(0,255,65,0.3)', letterSpacing:4, marginBottom:20, fontFamily:"'Share Tech Mono',monospace" }}>
        THE WORLD IS A SIMULATION. A GLITCH IN THE MATRIX.
      </div>

      {/* Rings + button */}
      <div style={{ position:'relative', display:'inline-block' }}>
        <AnimatePresence>
          {hover && (
            <>
              <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}} style={{ position:'absolute', inset:-18, border:'1px solid rgba(0,255,65,0.2)', borderRadius:'50%', animation:'spin 10s linear infinite' }}/>
              <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}} style={{ position:'absolute', inset:-30, border:'1px dashed rgba(0,255,65,0.12)', borderRadius:'50%', animation:'spinR 15s linear infinite' }}/>
              <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}} style={{ position:'absolute', inset:-44, border:'1px solid rgba(0,255,65,0.06)', borderRadius:'50%', animation:'spin 22s linear infinite' }}/>
            </>
          )}
        </AnimatePresence>
        <button
          onMouseEnter={() => { setHover(true); playBeep(880, 0.06) }}
          onMouseLeave={() => setHover(false)}
          onClick={handleClick}
          className="btn-primary"
          style={{ fontSize:12, padding:'16px 32px', position:'relative', zIndex:1, boxShadow: hover ? '0 0 50px #00ff41' : '0 0 20px rgba(0,255,65,0.2)' }}
        >
          {ripples.map(r => (
            <span key={r.id} style={{ position:'absolute', width:10, height:10, borderRadius:'50%', background:'rgba(0,255,65,0.6)', left: r.x-5, top: r.y-5, animation:'ripple 0.7s linear', pointerEvents:'none' }}/>
          ))}
          INITIATE_TRANSFER
        </button>
      </div>

      <div style={{ marginTop:14, textAlign:'center' }}>
            <button onClick={()=>{playClick(); onTimeline()}} style={{ background:'transparent', border:'1px solid rgba(0,255,65,0.15)', color:'#005522', padding:'5px 14px', cursor:'crosshair', fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:2 }}>⏱ TX_TIMELINE</button>
          </div>
          <div style={{ marginTop:10, display:'flex', justifyContent:'center', gap:14, fontSize:7, color:'#004411', flexWrap:'wrap' }}>
        {['DARAJA_API','AES-256-GCM','STK_PUSH_v2','HMAC-SHA256','0-FEE'].map(s=>(
          <span key={s}>● {s}</span>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// RADAR PANEL
// ─────────────────────────────────────────────
function RadarPanel() {
  const [contacts, setContacts] = useState(5)
  useEffect(() => {
    const t = setInterval(() => setContacts(4 + Math.floor(Math.random()*4)), 4000)
    return () => clearInterval(t)
  }, [])
  return (
    <motion.div className="panel"
      initial={{ opacity:0, x:20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:0.2, duration:0.5 }}
    >
      <div className="panel-header">
        <span>RADAR // NBI-SECTOR-7</span>
        <span className="blink" style={{ color:'#00ff41', fontSize:7 }}>SCANNING</span>
      </div>
      <div style={{ padding:10, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
        <RadarScan size={190}/>
        <div style={{ width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, fontSize:7 }}>
          {[['CONTACTS',String(contacts)],['RANGE','50KM'],['HEADING','237°']].map(([k,v])=>(
            <div key={k} style={{ textAlign:'center', background:'rgba(0,255,65,0.04)', border:'1px solid rgba(0,255,65,0.1)', padding:'4px 2px' }}>
              <div style={{ color:'#004411' }}>{k}</div>
              <div style={{ color:'#00ff41', fontFamily:"'Orbitron',monospace", fontSize:9 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// NETWORK PANEL
// ─────────────────────────────────────────────
function NetworkPanel() {
  const [bars, setBars] = useState<number[]>(() => Array.from({length:22},()=>Math.random()*9+1))
  const [packets, setPackets] = useState({ rx: 0, tx: 0 })

  useEffect(() => {
    const t1 = setInterval(() => setBars(Array.from({length:22},()=>Math.random()*9+1)), 600)
    const t2 = setInterval(() => setPackets(p => ({ rx: p.rx + Math.floor(Math.random()*150), tx: p.tx + Math.floor(Math.random()*80) })), 800)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <motion.div className="panel"
      initial={{ opacity:0, x:20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:0.35, duration:0.5 }}
    >
      <div className="panel-header">
        <span>NET_INTERFACE // eth0</span>
        <span style={{ color:'#00ff41', fontSize:7 }}>FULL_DUPLEX</span>
      </div>
      <div style={{ padding:'8px 10px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:30, marginBottom:6 }}>
          {bars.map((h,i) => (
            <div key={i} style={{ flex:1, height:`${h*10}%`, background:'#00ff41', borderRadius:1, boxShadow:'0 0 3px #00ff4166', transition:'height 0.45s ease' }}/>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, fontSize:7 }}>
          {[
            ['LATENCY','23ms'],['MTU','1500B'],
            ['RX_PKT', packets.rx.toLocaleString()],['TX_PKT', packets.tx.toLocaleString()],
            ['CIPHER','TLS1.3'],['STATUS','NOMINAL'],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#004411' }}>{k}</span>
              <span style={{ color:'#00cc33' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Home() {
  const [booted, setBooted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    if (!booted) return
    const t = setInterval(() => {
      if (Math.random() > 0.82) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 180)
      }
    }, 5000)
    return () => clearInterval(t)
  }, [booted])

  return (
    <div style={{ minHeight:'100vh', background:'#000a00', position:'relative', overflow:'hidden' }}>
      <SoundEngine />
      <MatrixRain />

      {/* Moving grid floor */}
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:'linear-gradient(rgba(0,255,65,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.022) 1px,transparent 1px)', backgroundSize:'40px 40px', animation:'gridMove 10s linear infinite', pointerEvents:'none' }}/>

      <AnimatePresence mode="wait">
        {!booted ? (
          <BootScreen key="boot" onDone={() => setBooted(true)} />
        ) : (
          <motion.div key="main" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }} style={{ position:'relative', zIndex:2 }}>
            <StatusBar />

            {/* GLITCH overlay */}
            <AnimatePresence>
              {glitch && (
                <motion.div
                  initial={{ opacity:0 }}
                  animate={{ opacity:[0,0.6,0.3,0.8,0] }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.18 }}
                  style={{ position:'fixed', inset:0, zIndex:9995, background:'rgba(0,255,65,0.03)', pointerEvents:'none',
                    backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,255,65,0.08) 1px,rgba(0,255,65,0.08) 2px)' }}
                />
              )}
            </AnimatePresence>

            {/* 3-column grid */}
            <div className="main-grid" style={{
              display:'grid',
              gridTemplateColumns:'260px 1fr 240px',
              gap:8, padding:8, paddingTop:52,
              minHeight:'100vh',
              animation: glitch ? 'glitch 0.18s ease' : 'none',
            }}>
              {/* LEFT */}
              <div className="left-col" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <ProfilePanel />
                <BalancePanel />
                <RecentTx />
                <StatusBars />
              </div>

              {/* CENTER */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <HeroPanel onSend={() => { playClick(); setShowModal(true) }} onTimeline={() => setShowTimeline(true)} />
                <DataGrid />
              </div>

              {/* RIGHT */}
              <div className="right-col" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <MoneyGlobe />
                <RadarPanel />
                <NetworkPanel />
                <TerminalLog />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <PaymentModal onClose={() => setShowModal(false)} />
        )}
        {showTimeline && (
          <TxTimeline onClose={() => setShowTimeline(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
