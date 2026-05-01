'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { playBeep, playClick } from './SoundEngine'

const CODENAMES = ['OPERATION_UNCLE_KEVO','DIRECTIVE_MAMA_CAROL','PROTOCOL_FREELANCE_X',
  'MISSION_NAIVAS_RUN','EXECUTE_RENT_DAY','DIRECTIVE_MPANGO_WA_KANDO',
  'OPERATION_SUNDAY_ROAST','PROTOCOL_BUS_FARE','MISSION_DATA_BUNDLE']

const FLAVOUR = [
  'Funds cleared before the sun did.',
  'She said thanks. Once. That was enough.',
  'The simulation records this transfer without judgement.',
  'KES moved. A relationship maintained. Barely.',
  'No receipt requested. No questions asked.',
  'Third transfer this month. Pattern detected.',
  'Sent at 23:47. The desperation is noted.',
  'Quick. Clean. Untraceable. Except it isn\'t.',
  'The money knows where it\'s going. Do you?',
]

interface Tx {
  id: string; type: 'RECV'|'SEND'; amount: string; from: string
  t: string; hash: string; codename: string; flavour: string; block: number
}

const MOCK_TXS: Tx[] = [
  { id:'QK8X2B', type:'RECV', amount:'+12,500', from:'MAMA_CAROL',    t:'09:12:44', hash:'0xa3f2c1', codename:CODENAMES[0], flavour:FLAVOUR[0], block:4721892 },
  { id:'PL9Y4A', type:'SEND', amount:'-5,000',  from:'UNCLE_KEVO',    t:'08:44:11', hash:'0xb7c19e', codename:CODENAMES[1], flavour:FLAVOUR[1], block:4721801 },
  { id:'MN3Z1C', type:'RECV', amount:'+3,200',  from:'FREELANCE_X',   t:'07:30:05', hash:'0xd4e847', codename:CODENAMES[2], flavour:FLAVOUR[2], block:4721744 },
  { id:'RQ7W8D', type:'SEND', amount:'-800',    from:'NAIVAS_POS',    t:'YST 23:10',hash:'0xf1a9b3', codename:CODENAMES[3], flavour:FLAVOUR[3], block:4721602 },
  { id:'XZ2K9L', type:'SEND', amount:'-15,000', from:'RENT_ACCOUNT',  t:'YST 10:00',hash:'0xe6c3d1', codename:CODENAMES[4], flavour:FLAVOUR[4], block:4721455 },
  { id:'BN4M7Q', type:'RECV', amount:'+2,000',  from:'MPANGO_X',      t:'2D AGO',   hash:'0xc8a152', codename:CODENAMES[5], flavour:FLAVOUR[5], block:4721200 },
  { id:'KP5T3W', type:'SEND', amount:'-500',    from:'SUNDAY_LUNCH',  t:'2D AGO',   hash:'0x9f2e77', codename:CODENAMES[6], flavour:FLAVOUR[6], block:4721088 },
  { id:'VH8Y6R', type:'SEND', amount:'-200',    from:'MATATU_FARE',   t:'3D AGO',   hash:'0x7b4c63', codename:CODENAMES[7], flavour:FLAVOUR[7], block:4720900 },
]

function TxCard({ tx, index }: { tx: Tx; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (inView) playBeep(400 + index * 80, 0.05, 0.04)
  }, [inView, index])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ position: 'relative', marginBottom: 20 }}
    >
      {/* Timeline line + dot */}
      <div style={{ position:'absolute', left:16, top:0, bottom:-20, width:1, background:'rgba(0,255,65,0.12)' }}/>
      <div style={{
        position:'absolute', left:10, top:16, width:13, height:13, borderRadius:'50%',
        background: tx.type==='RECV' ? '#00ff41' : '#ff6600',
        boxShadow: `0 0 10px ${tx.type==='RECV' ? '#00ff41' : '#ff6600'}`,
        border:'2px solid #000a00',
        zIndex:1
      }}/>

      {/* Card */}
      <div style={{ marginLeft:36 }}>
        <motion.div
          onClick={() => { setExpanded(e => !e); playClick() }}
          whileHover={{ borderColor:'rgba(0,255,65,0.35)' }}
          style={{
            background:'rgba(0,14,4,0.95)', border:'1px solid rgba(0,255,65,0.15)',
            padding:'10px 12px', cursor:'crosshair', position:'relative', overflow:'hidden',
            transition:'border-color 0.15s'
          }}
        >
          {/* Scan line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(0,255,65,0.3),transparent)', animation:'typewriter 4s ease infinite' }}/>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:7, color:'#004411', letterSpacing:2, marginBottom:3 }}>{tx.codename}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color: tx.type==='RECV'?'#00ff41':'#ff6600', textShadow:`0 0 8px ${tx.type==='RECV'?'#00ff41':'#ff6600'}` }}>
                {tx.amount}
              </div>
              <div style={{ fontSize:8, color:'#006622', marginTop:2 }}>{tx.from} // {tx.t}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:7, color:'#004411' }}>{tx.id}</div>
              <div style={{ fontSize:7, color:'#003311', marginTop:2 }}>BLK #{tx.block.toLocaleString()}</div>
              <div style={{ fontSize:9, color:'#004411', marginTop:4 }}>{expanded ? '▲' : '▼'}</div>
            </div>
          </div>
        </motion.div>

        {/* Expanded detail */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow:'hidden' }}
        >
          <div style={{ background:'rgba(0,8,0,0.9)', border:'1px solid rgba(0,255,65,0.08)', borderTop:'none', padding:'10px 12px' }}>
            <div style={{ fontSize:8, color:'#007700', fontStyle:'italic', marginBottom:8, lineHeight:1.6, borderLeft:'2px solid rgba(0,255,65,0.2)', paddingLeft:8 }}>
              &ldquo;{tx.flavour}&rdquo;
            </div>
            {[
              ['TX_HASH', tx.hash+'...'+Math.random().toString(16).slice(2,8)],
              ['BLOCK', '#'+tx.block.toLocaleString()],
              ['GAS_FEE', 'KES 0.00'],
              ['NETWORK', 'SAFARICOM_MAINNET'],
              ['CONFIRM', '✓ IRREVERSIBLE'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:8, padding:'2px 0', borderBottom:'1px solid rgba(0,255,65,0.04)' }}>
                <span style={{ color:'#004411' }}>{k}</span>
                <span style={{ color: k==='CONFIRM'?'#00ff41':'#006622' }}>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TxTimeline({ onClose }: { onClose: () => void }) {
  const [txs] = useState<Tx[]>(MOCK_TXS)

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, zIndex:1500, background:'rgba(0,4,0,0.97)', overflowY:'auto', fontFamily:"'Share Tech Mono',monospace" }}
    >
      {/* Sticky header */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(0,4,0,0.98)', borderBottom:'1px solid rgba(0,255,65,0.15)', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, color:'#00ff41', textShadow:'0 0 10px #00ff41', letterSpacing:3 }}>TX_TIMELINE</div>
          <div style={{ fontSize:7, color:'#005522', marginTop:2, letterSpacing:2 }}>MISSION DOSSIERS // SORTED BY BLOCK HEIGHT</div>
        </div>
        <button onClick={() => { playClick(); onClose() }} style={{
          background:'transparent', border:'1px solid rgba(255,51,0,0.4)', color:'#ff3300',
          padding:'6px 14px', cursor:'crosshair', fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:2
        }}>
          ✕ CLOSE
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, borderBottom:'1px solid rgba(0,255,65,0.08)' }}>
        {[
          ['TOTAL_IN', '+KES 17,700', '#00ff41'],
          ['TOTAL_OUT', '-KES 21,500', '#ff6600'],
          ['NET_PNL', '-KES 3,800', '#ff3300'],
          ['TX_COUNT', '8 OPS', '#00ccff'],
        ].map(([k,v,c]) => (
          <div key={k} style={{ padding:'10px 16px', background:'rgba(0,12,4,0.8)', textAlign:'center' }}>
            <div style={{ fontSize:7, color:'#004411', letterSpacing:2, marginBottom:3 }}>{k}</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:c as string }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ padding:'24px 20px', maxWidth:560, margin:'0 auto' }}>
        <div style={{ fontSize:8, color:'#004411', letterSpacing:3, marginBottom:20 }}>// TRANSACTION_HISTORY // ALL TIME</div>
        {txs.map((tx, i) => <TxCard key={tx.id} tx={tx} index={i} />)}

        {/* End of chain */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          style={{ textAlign:'center', padding:'20px 0', borderTop:'1px solid rgba(0,255,65,0.08)' }}
        >
          <div style={{ fontSize:8, color:'#004411', letterSpacing:3 }}>// GENESIS_BLOCK</div>
          <div style={{ fontSize:9, color:'#003311', marginTop:4 }}>THE CHAIN BEGINS HERE. OR DOES IT.</div>
        </motion.div>
      </div>
    </motion.div>
  )
}
