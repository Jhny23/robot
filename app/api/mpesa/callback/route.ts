import { NextRequest, NextResponse } from 'next/server'

// Store callbacks in memory (use DB in production)
const callbacks = new Map<string, unknown>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = body?.Body?.stkCallback
    if (result?.CheckoutRequestID) {
      callbacks.set(result.CheckoutRequestID, result)
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (id && callbacks.has(id)) {
    return NextResponse.json({ found: true, data: callbacks.get(id) })
  }
  return NextResponse.json({ found: false })
}
