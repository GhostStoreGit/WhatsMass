import { NextRequest, NextResponse } from 'next/server'
import { searchGroups, SUPPORTED_SITES } from '@/lib/scraper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, site, limit = 50 } = body

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Palavra-chave obrigatoria' },
        { status: 400 }
      )
    }

    if (!site || !SUPPORTED_SITES.find(s => s.id === site)) {
      return NextResponse.json(
        { success: false, error: 'Site invalido. Use: gruposwhats, grupos-online ou whatsgrupos' },
        { status: 400 }
      )
    }

    const groups = await searchGroups({
      keyword,
      site,
      limit: Math.min(limit, 100),
    })

    return NextResponse.json({
      success: true,
      data: {
        keyword,
        site,
        total: groups.length,
        groups,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      sites: SUPPORTED_SITES,
    },
  })
}
