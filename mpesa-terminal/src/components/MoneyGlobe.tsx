'use client'
import { useEffect, useRef, useState } from 'react'

interface Arc {
  id: number
  fromLat: number; fromLng: number
  toLat: number; toLng: number
  progress: number
  speed: number
  amount: string
  color: string
  label: string
}

const CITIES = [
  { name:'NAIROBI',    lat:-1.29,  lng:36.82 },
  { name:'MOMBASA',   lat:-4.05,  lng:39.67 },
  { name:'KISUMU',    lat:-0.09,  lng:34.76 },
  { name:'NAKURU',    lat:-0.28,  lng:36.07 },
  { name:'ELDORET',   lat:0.52,   lng:35.27 },
  { name:'KAMPALA',   lat:0.32,   lng:32.58 },
  { name:'DAR_ES',    lat:-6.79,  lng:39.21 },
  { name:'ADDIS',     lat:8.99,   lng:38.75 },
  { name:'LONDON',    lat:51.51,  lng:-0.13 },
  { name:'DUBAI',     lat:25.20,  lng:55.27 },
]

function latLngToXY(lat: number, lng: number, w: number, h: number, rotX: number) {
  const adjustedLng = ((lng + rotX) % 360 + 360) % 360
  const x = (adjustedLng / 360) * w
  const y = ((90 - lat) / 180) * h
  return { x, y }
}

function arcPoint(from: {x:number,y:number}, to: {x:number,y:number}, t: number) {
  // Bezier with arc height
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 - 40
  const x = (1-t)*(1-t)*from.x + 2*(1-t)*t*mx + t*t*to.x
  const y = (1-t)*(1-t)*from.y + 2*(1-t)*t*my + t*t*to.y
  return { x, y }
}

export default function MoneyGlobe() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [arcs, setArcs] = useState<Arc[]>([])
  const [rotX, setRotX] = useState(0)
  const [hoveredCity, setHoveredCity] = useState<string|null>(null)
  const arcIdRef = useRef(0)

  const W = 320, H = 180

  // Spawn arcs
  useEffect(() => {
    const spawn = () => {
      const from = CITIES[Math.floor(Math.random()*CITIES.length)]
      let to = CITIES[Math.floor(Math.random()*CITIES.length)]
      while (to === from) to = CITIES[Math.floor(Math.random()*CITIES.length)]
      const colors = ['#00ff41','#aaff00','#00ffff','#ff9900']
      const amounts = ['500','1,200','3,000','500','750','2,500','10,000','250']
      setArcs(p => [...p.slice(-12), {
        id: arcIdRef.current++,
        fromLat: from.lat, fromLng: from.lng,
        toLat: to.lat, toLng: to.lng,
        progress: 0, speed: 0.008 + Math.random()*0.012,
        amount: 'KES '+amounts[Math.floor(Math.random()*amounts.length)],
        color: colors[Math.floor(Math.random()*colors.length)],
        label: from.name+'→'+to.name,
      }])
    }
    const iv = setInterval(spawn, 1200)
    spawn(); spawn(); spawn()
    return () => clearInterval(iv)
  }, [])

  // Animate arcs + rotation
  useEffect(() => {
    let raf: number
    const tick = () => {
      setArcs(p => p.map(a => ({ ...a, progress: Math.min(a.progress + a.speed, 1) })).filter(a => a.progress < 1))
      setRotX(r => (r + 0.12) % 360)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Draw longitude/latitude grid lines
  const gridLines: string[] = []
  // Longitude lines
  for (let lng = -180; lng < 180; lng += 30) {
    const pts = []
    for (let lat = -80; lat <= 80; lat += 10) {
      const p = latLngToXY(lat, lng, W, H, rotX)
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    }
    gridLines.push(pts.join(' '))
  }
  // Latitude lines
  const latLines: string[] = []
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = []
    for (let lng = -180; lng <= 180; lng += 10) {
      const p = latLngToXY(lat, lng, W, H, rotX)
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    }
    latLines.push(pts.join(' '))
  }

  return (
    <div className="panel" style={{ animation:'fadeUp 0.5s ease 0.2s both' }}>
      <div className="panel-header">
        <span>TX_GLOBE // LIVE FLOW</span>
        <span style={{ color:'#00ff41', fontSize:7 }}>
          {arcs.length} ACTIVE ARCS
        </span>
      </div>
      <div style={{ padding:'8px 8px 4px', position:'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', display:'block', overflow:'visible' }}>
          <defs>
            <radialGradient id="globeBg" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#003a18"/>
              <stop offset="100%" stopColor="#000a00"/>
            </radialGradient>
            <clipPath id="globeClip">
              <ellipse cx={W/2} cy={H/2} rx={W/2-2} ry={H/2-2}/>
            </clipPath>
          </defs>

          {/* Globe background */}
          <ellipse cx={W/2} cy={H/2} rx={W/2-2} ry={H/2-2} fill="url(#globeBg)"/>

          {/* Grid */}
          <g clipPath="url(#globeClip)" opacity="0.2">
            {gridLines.map((pts,i) => <polyline key={`lng${i}`} points={pts} fill="none" stroke="#00ff41" strokeWidth="0.4"/>)}
            {latLines.map((pts,i) => <polyline key={`lat${i}`} points={pts} fill="none" stroke="#00ff41" strokeWidth="0.4"/>)}
          </g>

          {/* Arc trails */}
          {arcs.map(arc => {
            const from = latLngToXY(arc.fromLat, arc.fromLng, W, H, rotX)
            const to = latLngToXY(arc.toLat, arc.toLng, W, H, rotX)
            const segments = 20
            const pts = []
            for (let i = 0; i <= segments * arc.progress; i++) {
              const t = (i/segments)
              const p = arcPoint(from, to, t)
              pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`)
            }
            if (pts.length < 2) return null
            const head = arcPoint(from, to, arc.progress)
            return (
              <g key={arc.id} clipPath="url(#globeClip)">
                <polyline points={pts.join(' ')} fill="none" stroke={arc.color} strokeWidth="1" opacity="0.7" strokeLinecap="round"/>
                <circle cx={head.x} cy={head.y} r="2" fill={arc.color} opacity="0.9"/>
                {arc.progress > 0.4 && arc.progress < 0.65 && (
                  <text x={head.x+4} y={head.y-3} fill={arc.color} fontSize="5" opacity="0.8">{arc.amount}</text>
                )}
              </g>
            )
          })}

          {/* City dots */}
          {CITIES.map(city => {
            const p = latLngToXY(city.lat, city.lng, W, H, rotX)
            const isHovered = hoveredCity === city.name
            return (
              <g key={city.name} onMouseEnter={() => setHoveredCity(city.name)} onMouseLeave={() => setHoveredCity(null)} style={{ cursor:'crosshair' }}>
                <circle cx={p.x} cy={p.y} r={isHovered ? 4 : 2.5} fill={isHovered ? '#aaff00' : '#00ff41'} opacity="0.9"/>
                {isHovered && <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#aaff00" strokeWidth="0.5" opacity="0.5"/>}
                <text x={p.x+4} y={p.y-2} fill={isHovered?'#aaff00':'#00ff4188'} fontSize="4.5">{city.name}</text>
              </g>
            )
          })}

          {/* Globe border */}
          <ellipse cx={W/2} cy={H/2} rx={W/2-2} ry={H/2-2} fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="1"/>
        </svg>

        {/* Live counter */}
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:7, color:'#005522', padding:'2px 4px' }}>
          <span>ROTATION: {rotX.toFixed(0)}°</span>
          <span>LIVE TX ARCS: {arcs.length}</span>
          <span>NODES: {CITIES.length}</span>
        </div>
      </div>
    </div>
  )
}
