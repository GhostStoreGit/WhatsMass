import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get dashboard statistics
export async function GET() {
  try {
    const [
      totalGroups,
      joinedGroups,
      pendingGroups,
      totalContacts,
      totalCampaigns,
      activeCampaigns,
      queuePending,
      recentLogs,
    ] = await Promise.all([
      prisma.group.count(),
      prisma.group.count({ where: { status: 'JOINED' } }),
      prisma.group.count({ where: { status: 'PENDING' } }),
      prisma.contact.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'RUNNING' } }),
      prisma.queueItem.count({ where: { status: 'PENDING' } }),
      prisma.log.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        groups: {
          total: totalGroups,
          joined: joinedGroups,
          pending: pendingGroups,
        },
        contacts: {
          total: totalContacts,
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
        },
        queue: {
          pending: queuePending,
        },
        recentLogs,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
