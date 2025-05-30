import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { name, amount } = await req.json()
    
    console.log('Checkout request:', { name, amount })
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)

    // Convert dollars to cents
    const amountInCents = Math.round(parseFloat(amount) * 100)

    if (amountInCents < 100) {
      return NextResponse.json({ error: 'Minimum amount is $1' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${baseUrl}?success=true`,
      cancel_url: `${baseUrl}?canceled=true`,
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BIDBOARD Spot - ${name}`,
              description: `Claim your spot on the BIDBOARD leaderboard`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        name,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    }, { status: 500 })
  }
} 