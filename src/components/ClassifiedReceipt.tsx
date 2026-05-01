'use client'
import { useRef } from 'react'
import { playSuccess, playBeep } from './SoundEngine'

interface ReceiptData {
  txCode: string
  amount: string
  phone: string
  ref: string
  timestamp: string
  checkoutId?: string
}

function pad(s: string, n: number) { return s.padEnd(n, ' ') }

export default function ClassifiedReceipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const lines = [
    '╔══════════════════════════════════════════════╗',
    '║     REPUBLIC OF KENYA — FINANCIAL COMMAND    ║',
    '║          CLASSIFIED TRANSACTION DOSSIER      ║',
    '╠══════════════════════════════════════════════╣',
    `║  OPERATION: ${pad('HEISENBERG_'+data.txCode, 33)}║`,
    `║  CLEARANCE: ${pad('TOP SECRET // EYES ONLY', 33)}║`,
    `║  TIMESTAMP: ${pad(data.timestamp, 33)}║`,
    '╠══════════════════════════════════════════════╣',
    `║  AMOUNT....: ${pad('KES '+data.amount, 33)}║`,
    `║  TARGET....: ${pad('████████ ('+data.phone.slice(-4)+')', 33)}║`,
    `║  METHOD....: ${pad('LIPA NA MPESA STK PUSH v2', 33)}║`,
    `║  RECEIPT...: ${pad(data.txCode, 33)}║`,
    `║  REFERENCE.: ${pad(data.ref || 'UNDISCLOSED', 33)}║`,
    `║  CHECKOUT..: ${pad((data.checkoutId||'REDACTED').slice(-16), 33)}║`,
    '╠══════════════════════════════════════════════╣',
    '║  ENCRYPTION: AES-256-GCM  PROTOCOL: TLS 1.3 ║',
    '║  DARAJA API: SAFARICOM    ENV: LIVE          ║',
    '╠══════════════════════════════════════════════╣',
    '║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║',
    '║  THIS DOCUMENT IS CLASSIFIED LEVEL 5         ║',
    '║  UNAUTHORISED DISCLOSURE — CRIMINAL OFFENCE  ║',
    '║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║',
    '╚══════════════════════════════════════════════╝',
  ]

  const handlePrint = () => {
    playBeep(440, 0.1, 0.1)
    const w = window.open('', '_blank', 'width=600,height=700')
    if (!w) return
    w.document.write(`
      <html><head><title>TX_${data.txCode}</title>
      <style>
        body { background:#000a00; color:#00ff41; font-family:'Courier New',monospace; font-size:13px; padding:40px; }
        pre { line-height:1.6; }
        .stamp { color:#ff3300; font-size:28px; font-weight:bold; border:3px solid #ff3300; padding:6px 20px; display:inline-block; transform:rotate(-12deg); position:absolute; top:60px; right:60px; opacity:0.8; }
        .bar { background:#ff3300; height:18px; margin:4px 0; opacity:0.7; }
        @media print { body { background: white; color: black; } .stamp { color: red; border-color: red; } }
      </style></head>
      <body>
        <div class="stamp">CLASSIFIED</div>
        <pre>${lines.join('\n')}</pre>
        <div style="margin-top:20px;font-size:10px;color:#005522;">
          <div>BARCODE: |||||| ||| || |||| ||| |||||||||| || ||| ||||||</div>
          <div>HASH: SHA256:${Array.from({length:32},()=>Math.floor(Math.random()*16).toString(16)).join('')}</div>
          <div>VERIFIED BY: CENTRAL BANK OF KENYA // MPESA CLEARINGHOUSE</div>
        </div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:2000,
      background:'rgba(0,3,0,0.97)', display:'flex', alignItems:'center', justifyContent:'center',
      padding:16
    }}>
      <div ref={ref} style={{
        maxWidth:540, width:'100%',
        background:'#000a00',
        border:'1px solid rgba(255,51,0,0.4)',
        boxShadow:'0 0 60px rgba(255,51,0,0.1)',
        position:'relative', overflow:'hidden',
        animation:'fadeUp 0.4s ease'
      }}>
        {/* Diagonal CLASSIFIED watermark */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%) rotate(-25deg)',
          fontSize:48, fontWeight:900, color:'rgba(255,51,0,0.07)',
          letterSpacing:8, pointerEvents:'none', whiteSpace:'nowrap',
          fontFamily:"'Orbitron',monospace"
        }}>CLASSIFIED</div>

        {/* Top red bar */}
        <div style={{ background:'rgba(255,51,0,0.15)', borderBottom:'1px solid rgba(255,51,0,0.3)', padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:'#ff3300', letterSpacing:3 }}>⚠ TOP SECRET // EYES ONLY</span>
          <span style={{ fontSize:9, color:'#ff3300', fontFamily:"'Share Tech Mono',monospace" }}>CLASSIFICATION: LEVEL 5</span>
        </div>

        {/* Receipt text */}
        <div style={{ padding:'16px 14px' }}>
          <pre style={{
            fontFamily:"'Share Tech Mono',monospace", fontSize:10.5,
            color:'#00ff41', lineHeight:1.65, margin:0, whiteSpace:'pre',
            overflow:'auto',
          }}>
{lines.join('\n')}
          </pre>

          {/* Stamp */}
          <div style={{
            position:'absolute', top:60, right:24,
            border:'2px solid rgba(255,51,0,0.7)', color:'rgba(255,51,0,0.7)',
            fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:900,
            padding:'4px 10px', transform:'rotate(-12deg)',
            letterSpacing:3, textShadow:'0 0 10px #ff3300'
          }}>
            CLASSIFIED
          </div>

          {/* Barcode */}
          <div style={{ marginTop:10, display:'flex', gap:1, alignItems:'flex-end', height:20 }}>
            {Array.from({length:60}).map((_,i) => (
              <div key={i} style={{ width:2, height: Math.random()>0.4?'100%':'60%', background:'rgba(0,255,65,0.6)' }}/>
            ))}
          </div>
          <div style={{ fontSize:7, color:'#005522', letterSpacing:1, marginTop:3 }}>
            {data.txCode} // SHA256:{Array.from({length:16},()=>Math.floor(Math.random()*16).toString(16)).join('')}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid rgba(0,255,65,0.1)', overflow:'hidden' }}>
          <button onClick={handlePrint} style={{
            background:'transparent', border:'none', borderRight:'1px solid rgba(0,255,65,0.1)',
            color:'#007700', padding:12, cursor:'crosshair',
            fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:2,
            transition:'all 0.15s'
          }}
          onMouseEnter={e=>(e.target as HTMLElement).style.color='#00ff41'}
          onMouseLeave={e=>(e.target as HTMLElement).style.color='#007700'}>
            ⎙ PRINT_DOSSIER
          </button>
          <button onClick={onClose} style={{
            background:'transparent', border:'none',
            color:'#007700', padding:12, cursor:'crosshair',
            fontFamily:"'Share Tech Mono',monospace", fontSize:10, letterSpacing:2,
            transition:'all 0.15s'
          }}
          onMouseEnter={e=>(e.target as HTMLElement).style.color='#ff3300'}
          onMouseLeave={e=>(e.target as HTMLElement).style.color='#007700'}>
            ✕ SHRED_FILE
          </button>
        </div>
      </div>
    </div>
  )
}
