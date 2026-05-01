import { NextRequest, NextResponse } from 'next/server'

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!
const SHORTCODE = process.env.MPESA_SHORTCODE!
const PASSKEY = process.env.MPESA_PASSKEY!
const ENV = process.env.MPESA_ENV || 'sandbox'

const BASE_URL = ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

async function getToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` }
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { phone, amount, ref } = await req.json()

    // Validate
    if (!phone || !amount) {
      return NextResponse.json({ success: false, error: 'Phone and amount required' }, { status: 400 })
    }

    // Format phone: 07xx -> 2547xx
    const formatted = phone.replace(/^0/, '254').replace(/^\+/, '')

    // Timestamp
    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64')

    // Get token
    const token = await getToken()

    // Callback URL - use ngrok or your domain in production
    const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback'

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(Number(amount)),
      PartyA: formatted,
      PartyB: SHORTCODE,
      PhoneNumber: formatted,
      CallBackURL: callbackUrl,
      AccountReference: ref || 'MPESA_TERMINAL',
      TransactionDesc: ref || 'Payment via MPESA Terminal'
    }

    const stkRes = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const stkData = await stkRes.json()

    if (stkData.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        message: stkData.CustomerMessage || 'STK Push sent successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: stkData.errorMessage || stkData.ResponseDescription || 'STK Push failed',
        raw: stkData
      }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
