import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Stripe collects email during checkout
      const email = session.customer_email || session.customer_details?.email || ''
      const name = session.metadata?.name || 'Anonymous'
      const logoUrl = session.metadata?.logoUrl || null
      const message = session.metadata?.message || null
      const newAmount = session.amount_total || 0

      if (!email) {
        // Fallback: create new entry if no email (shouldn't happen with Stripe)
        await prisma.entry.create({
          data: {
            name: name,
            amount: newAmount,
            email: `anonymous_${Date.now()}@bidboard.com`,
            stripeSessionId: session.id,
            paid: true,
            // Only set logoUrl and message if they exist
            ...(logoUrl && { logoUrl }),
            ...(message && { message }),
          },
        })
      } else {
        // Check if this email already has an entry
        const existingEntry = await prisma.entry.findFirst({
          where: { 
            email: email,
            paid: true 
          }
        })

        if (existingEntry) {
          // Add to their existing total - they stay in one spot
          const updatedAmount = existingEntry.amount + newAmount
          
          // Check if they'll be #1 after this update
          const highestEntry = await prisma.entry.findFirst({
            where: { paid: true },
            orderBy: { amount: 'desc' },
          })
          
          const willBeFirst = !highestEntry || updatedAmount > highestEntry.amount || highestEntry.id === existingEntry.id
          
          await prisma.entry.update({
            where: { id: existingEntry.id },
            data: {
              amount: updatedAmount,
              name: name, // Update name in case they changed it
              // Only update logoUrl and message if they're becoming #1
              ...(willBeFirst && logoUrl && { logoUrl }),
              ...(willBeFirst && message && { message }),
              updatedAt: new Date()
            }
          })
          console.log(`${name} (${email}) added $${newAmount/100} to their total. New total: $${updatedAmount/100}`)
        } else {
          // First time bidder
          // Check if they'll be #1
          const highestEntry = await prisma.entry.findFirst({
            where: { paid: true },
            orderBy: { amount: 'desc' },
          })
          
          const willBeFirst = !highestEntry || newAmount > highestEntry.amount
          
          await prisma.entry.create({
            data: {
              name: name,
              amount: newAmount,
              email: email,
              stripeSessionId: session.id,
              paid: true,
              // Only set logoUrl and message if they're becoming #1
              ...(willBeFirst && logoUrl && { logoUrl }),
              ...(willBeFirst && message && { message }),
            },
          })
          console.log(`New bidder: ${name} (${email}) - $${newAmount/100}`)
        }
      }

      // Clear logoUrl and message from non-#1 entries
      // Get the current #1 after all updates
      const newLeader = await prisma.entry.findFirst({
        where: { paid: true },
        orderBy: { amount: 'desc' },
      })

      if (newLeader) {
        // Clear logoUrl and message from all entries except the new leader
        await prisma.entry.updateMany({
          where: {
            paid: true,
            id: { not: newLeader.id }
          },
          data: {
            logoUrl: null,
            message: null
          }
        })
      }

    } catch (error) {
      console.error('Error processing entry:', error)
      return NextResponse.json({ error: 'Failed to process entry' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
} 