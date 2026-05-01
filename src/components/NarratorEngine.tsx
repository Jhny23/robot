'use client'

const TEMPLATES = [
  (amt: string, to: string) => `${amt} transferred. ${to} won't return the favour. They never do.`,
  (amt: string, to: string) => `${amt} — gone. ${to} is now slightly richer, and you are slightly wiser.`,
  (amt: string, to: string) => `Transaction complete. ${amt} moved from your hands to ${to}. The simulation continues.`,
  (amt: string, to: string) => `${amt} has left the building. ${to} has been notified. The rest is silence.`,
  (amt: string, to: string) => `In the grand ledger of the simulation, ${amt} has shifted toward ${to}. Balance restored. For now.`,
  (amt: string, to: string) => `${amt} sent to ${to} at exactly the wrong time, or possibly the right time. Hard to say.`,
  (amt: string, _to: string) => `${amt} — just numbers on a screen until they aren't. Transfer successful.`,
  (amt: string, to: string) => `Money is a shared hallucination. You just hallucinated ${amt} into ${to}'s account.`,
  (amt: string, to: string) => `${amt} vanished from your ledger at ${new Date().toLocaleTimeString()}. ${to} will spend it by morning.`,
  (amt: string, to: string) => `The blockchain doesn't care. Safaricom doesn't care. But ${to} does. ${amt} delivered.`,
]

const HEISENBERG = [
  (amt: string) => `I am the one who sends. ${amt}. Say my name.`,
  (amt: string) => `${amt}. I did it for me. I liked it. I was good at it.`,
  (amt: string) => `You clearly don't know who you're sending to. ${amt}. Consider this a message.`,
]

let lastSpoken = 0

export function narrateTransaction(amount: string, recipient: string, isHeisenberg = false) {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return

  // Cooldown
  const now = Date.now()
  if (now - lastSpoken < 2000) return
  lastSpoken = now

  window.speechSynthesis.cancel()

  const pool = isHeisenberg && Math.random() > 0.5 ? HEISENBERG : TEMPLATES
  const template = pool[Math.floor(Math.random() * pool.length)]
  const text = isHeisenberg && pool === HEISENBERG
    ? (template as (a: string) => string)(amount)
    : (template as (a: string, t: string) => string)(amount, recipient)

  const utt = new SpeechSynthesisUtterance(text)

  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.name.toLowerCase().includes('male') ||
    v.name.toLowerCase().includes('daniel') ||
    v.name.toLowerCase().includes('alex') ||
    v.name.toLowerCase().includes('david')
  ) || voices[0]
  if (preferred) utt.voice = preferred

  utt.rate = 0.88
  utt.pitch = 0.75
  utt.volume = 0.9
  window.speechSynthesis.speak(utt)

  return text
}

// Pre-load voices
export function initNarrator() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
  }
}
