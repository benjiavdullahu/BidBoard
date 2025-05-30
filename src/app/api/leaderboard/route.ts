import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      where: { paid: true },
      orderBy: { amount: 'desc' },
      select: {
        id: true,
        name: true,
        amount: true,
        link: true,
        message: true,
        logoUrl: true,
        createdAt: true
      }
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
} 