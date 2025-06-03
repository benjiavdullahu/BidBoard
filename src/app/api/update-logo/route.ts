import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { logoUrl, message, entryId } = await req.json()
    
    if (!entryId) {
      return NextResponse.json({ error: 'Missing entryId' }, { status: 400 })
    }

    if (!logoUrl && message === undefined) {
      return NextResponse.json({ error: 'Must provide either logoUrl or message' }, { status: 400 })
    }

    // Build update data object
    const updateData: any = {
      updatedAt: new Date()
    }

    if (logoUrl) {
      updateData.logoUrl = logoUrl
    }

    if (message !== undefined) {
      updateData.message = message
    }

    // Update the entry's logo and/or message
    const updatedEntry = await prisma.entry.update({
      where: { 
        id: entryId,
        paid: true 
      },
      data: updateData
    })

    return NextResponse.json({ success: true, entry: updatedEntry })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update entry' 
    }, { status: 500 })
  }
} 