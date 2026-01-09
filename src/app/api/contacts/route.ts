import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List all contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (groupId) where.sourceGroupId = groupId
    if (tags) where.tags = { contains: tags }
    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { pushName: { contains: search } },
        { name: { contains: search } },
      ]
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sourceGroup: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        contacts,
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

// POST - Create contacts (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contactsData = Array.isArray(body.contacts) ? body.contacts : [body]

    const created = []
    const updated = []
    const skipped = []

    for (const data of contactsData) {
      if (!data.phoneNumber) {
        skipped.push(data)
        continue
      }

      // Check if exists
      const existing = await prisma.contact.findUnique({
        where: { phoneNumber: data.phoneNumber },
      })

      if (existing) {
        // Update if new info
        if (data.pushName || data.name) {
          const updatedContact = await prisma.contact.update({
            where: { phoneNumber: data.phoneNumber },
            data: {
              pushName: data.pushName || existing.pushName,
              name: data.name || existing.name,
            },
          })
          updated.push(updatedContact)
        } else {
          skipped.push(data.phoneNumber)
        }
        continue
      }

      const contact = await prisma.contact.create({
        data: {
          phoneNumber: data.phoneNumber,
          jid: data.jid,
          pushName: data.pushName,
          name: data.name,
          sourceGroupId: data.sourceGroupId,
          tags: data.tags,
        },
      })
      created.push(contact)
    }

    return NextResponse.json({
      success: true,
      data: {
        created: created.length,
        updated: updated.length,
        skipped: skipped.length,
        contacts: [...created, ...updated],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Delete contacts
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body.ids) ? body.ids : [body.id]

    await prisma.contact.deleteMany({
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
