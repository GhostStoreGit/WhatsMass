import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getEvolutionClient } from '@/lib/evolution/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, inviteCode } = body

    if (!groupId && !inviteCode) {
      return NextResponse.json(
        { success: false, error: 'groupId ou inviteCode obrigatório' },
        { status: 400 }
      )
    }

    let group = null
    let code = inviteCode

    // If groupId provided, get from database
    if (groupId) {
      group = await prisma.group.findUnique({
        where: { id: groupId },
      })

      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }

      code = group.inviteCode
    }

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Código de convite não encontrado' },
        { status: 400 }
      )
    }

    // Update status to joining
    if (group) {
      await prisma.group.update({
        where: { id: group.id },
        data: { status: 'JOINING' },
      })
    }

    // Call Evolution API to join
    const client = getEvolutionClient()
    const result = await client.joinGroup(code)

    if (!result.success) {
      // Update status to failed
      if (group) {
        await prisma.group.update({
          where: { id: group.id },
          data: { status: 'FAILED' },
        })
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Update status to joined
    if (group) {
      await prisma.group.update({
        where: { id: group.id },
        data: {
          status: 'JOINED',
          jid: result.data?.groupId,
          joinedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
