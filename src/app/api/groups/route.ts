import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getDefaultInstance } from '@/lib/instance'

// GET - List all groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { inviteCode: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { contacts: true },
          },
        },
      }),
      prisma.group.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        groups,
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

// POST - Create groups (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const instance = await getDefaultInstance()

    // Support single or array of groups
    const groupsData = Array.isArray(body.groups) ? body.groups : [body]

    const created = []
    const skipped = []

    for (const data of groupsData) {
      // Check if already exists by inviteCode
      if (data.inviteCode) {
        const existing = await prisma.group.findFirst({
          where: { inviteCode: data.inviteCode },
        })
        if (existing) {
          skipped.push(data.inviteCode)
          continue
        }
      }

      const group = await prisma.group.create({
        data: {
          instanceId: instance.id,
          name: data.name,
          inviteCode: data.inviteCode,
          inviteUrl: data.inviteUrl,
          description: data.description,
          source: data.source || 'SCRAPED',
          sourceUrl: data.sourceUrl,
          sourceKeyword: data.sourceKeyword,
          status: 'PENDING',
          tags: data.category || data.tags,
        },
      })
      created.push(group)
    }

    return NextResponse.json({
      success: true,
      data: {
        created: created.length,
        skipped: skipped.length,
        groups: created,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Delete groups
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids : [body.id]

    await prisma.group.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      data: { deleted: ids.length },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
