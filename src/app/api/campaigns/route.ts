import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getDefaultInstance } from '@/lib/instance'

// GET - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { groups: true, contacts: true },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
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

// POST - Create a campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const instance = await getDefaultInstance()

    const campaign = await prisma.campaign.create({
      data: {
        instanceId: instance.id,
        name: body.name,
        description: body.description,
        type: body.type || 'GROUP_MESSAGE',
        messageText: body.messageText,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        delayMin: body.delayMin || 30000,
        delayMax: body.delayMax || 60000,
        dailyLimit: body.dailyLimit || 200,
        hourlyLimit: body.hourlyLimit || 30,
        scheduleStart: body.scheduleStart,
        scheduleEnd: body.scheduleEnd,
        scheduleDays: body.scheduleDays,
        status: 'DRAFT',
      },
    })

    // Add groups if provided
    if (body.groupIds && body.groupIds.length > 0) {
      await prisma.campaignGroup.createMany({
        data: body.groupIds.map((groupId: string) => ({
          campaignId: campaign.id,
          groupId,
        })),
      })
    }

    // Add contacts if provided
    if (body.contactIds && body.contactIds.length > 0) {
      await prisma.campaignContact.createMany({
        data: body.contactIds.map((contactId: string) => ({
          campaignId: campaign.id,
          contactId,
        })),
      })
    }

    // Update total targets
    const totalTargets = (body.groupIds?.length || 0) + (body.contactIds?.length || 0)
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { totalTargets },
    })

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PUT - Update a campaign
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID obrigatório' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        messageText: data.messageText,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        delayMin: data.delayMin,
        delayMax: data.delayMax,
        dailyLimit: data.dailyLimit,
        hourlyLimit: data.hourlyLimit,
        scheduleStart: data.scheduleStart,
        scheduleEnd: data.scheduleEnd,
        scheduleDays: data.scheduleDays,
      },
    })

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a campaign
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID obrigatório' },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id },
    })

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
