import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List queue items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status) where.status = status
    if (action) where.action = action

    const [items, total, stats] = await Promise.all([
      prisma.queueItem.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { scheduledFor: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.queueItem.count({ where }),
      prisma.queueItem.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        stats: stats.reduce((acc, s) => {
          acc[s.status.toLowerCase()] = s._count
          return acc
        }, {} as Record<string, number>),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Add items to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items : [body]

    const created = await prisma.queueItem.createMany({
      data: items.map((item: any) => ({
        action: item.action,
        payload: typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload),
        priority: item.priority || 0,
        scheduledFor: item.scheduledFor ? new Date(item.scheduledFor) : new Date(),
        maxAttempts: item.maxAttempts || 3,
      })),
    })

    return NextResponse.json({
      success: true,
      data: { created: created.count },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Clear queue items
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, status } = body

    if (ids && ids.length > 0) {
      await prisma.queueItem.deleteMany({
        where: { id: { in: ids } },
      })
    } else if (status) {
      await prisma.queueItem.deleteMany({
        where: { status },
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'ids ou status obrigatório' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
