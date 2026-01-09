import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
        contacts: {
          include: {
            contact: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

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

// POST - Start/Stop/Pause campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body // start, stop, pause

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'start':
        if (campaign.status !== 'DRAFT' && campaign.status !== 'PAUSED') {
          return NextResponse.json(
            { success: false, error: 'Campanha não pode ser iniciada' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'RUNNING',
          startedAt: campaign.startedAt || new Date(),
        }
        break

      case 'pause':
        if (campaign.status !== 'RUNNING') {
          return NextResponse.json(
            { success: false, error: 'Campanha não está em execução' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'PAUSED',
          pausedAt: new Date(),
        }
        break

      case 'stop':
        if (campaign.status !== 'RUNNING' && campaign.status !== 'PAUSED') {
          return NextResponse.json(
            { success: false, error: 'Campanha não pode ser parada' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'CANCELLED',
          completedAt: new Date(),
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Ação inválida' },
          { status: 400 }
        )
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
