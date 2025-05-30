import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set (using fallback)',
  }

  const allSet = Object.entries(envVars).every(([key, value]) => 
    value === true || (key === 'NEXT_PUBLIC_BASE_URL' && value !== 'Not set (using fallback)')
  )

  return NextResponse.json({
    status: allSet ? 'All environment variables are set' : 'Some environment variables are missing',
    variables: envVars,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://bidboard.site (fallback)',
    nodeEnv: process.env.NODE_ENV,
  })
} 