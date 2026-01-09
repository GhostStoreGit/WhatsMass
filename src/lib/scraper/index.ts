import { parse } from 'node-html-parser'
import type { ScrapedGroup } from '@/types'

export interface ScraperOptions {
  keyword: string
  site: 'gruposwhats' | 'grupos-online' | 'whatsgrupos'
  limit?: number
}

export async function searchGroups(options: ScraperOptions): Promise<ScrapedGroup[]> {
  const { keyword, site, limit = 50 } = options

  switch (site) {
    case 'gruposwhats':
      return searchGruposWhatsApp(keyword, limit)
    case 'grupos-online':
      return searchGruposOnline(keyword, limit)
    case 'whatsgrupos':
      return searchWhatsGrupos(keyword, limit)
    default:
      throw new Error(`Site nao suportado: ${site}`)
  }
}

// Extrair invite code de uma URL
function extractInviteCode(url: string): string | null {
  const match = url.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/)
  return match ? match[1] : null
}

// Buscar links de WhatsApp em HTML
function extractWhatsAppLinks(html: string): string[] {
  const regex = /https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/g
  const matches = html.match(regex) || []
  return [...new Set(matches)]
}

// Scraper para gruposwhats.app
async function searchGruposWhatsApp(keyword: string, limit: number): Promise<ScrapedGroup[]> {
  const url = `https://gruposwhats.app/grupos/${encodeURIComponent(keyword)}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)
    const groups: ScrapedGroup[] = []

    // Tentar extrair cards de grupos
    const cards = root.querySelectorAll('.card, .group-card, .grupo-card, [class*="grupo"]')

    for (const card of cards) {
      if (groups.length >= limit) break

      const link = card.querySelector('a[href*="chat.whatsapp.com"]')
      if (!link) continue

      const inviteUrl = link.getAttribute('href') || ''
      const inviteCode = extractInviteCode(inviteUrl)
      if (!inviteCode) continue

      const nameEl = card.querySelector('h3, h4, h5, .title, .name, .grupo-name')
      const name = nameEl?.text?.trim() || `Grupo ${groups.length + 1}`

      const descEl = card.querySelector('p, .description, .desc')
      const description = descEl?.text?.trim()

      groups.push({
        name,
        inviteUrl,
        inviteCode,
        category: keyword,
        description,
        sourceUrl: url,
      })
    }

    // Fallback: regex para encontrar links
    if (groups.length === 0) {
      const links = extractWhatsAppLinks(html)
      for (const inviteUrl of links.slice(0, limit)) {
        const inviteCode = extractInviteCode(inviteUrl)
        if (inviteCode) {
          groups.push({
            name: `Grupo ${groups.length + 1}`,
            inviteUrl,
            inviteCode,
            category: keyword,
            sourceUrl: url,
          })
        }
      }
    }

    return groups
  } catch (error) {
    console.error('Erro ao buscar em gruposwhats.app:', error)
    return []
  }
}

// Scraper para grupos-online.com
async function searchGruposOnline(keyword: string, limit: number): Promise<ScrapedGroup[]> {
  const url = `https://grupos-online.com/search?q=${encodeURIComponent(keyword)}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const groups: ScrapedGroup[] = []
    const links = extractWhatsAppLinks(html)

    for (const inviteUrl of links.slice(0, limit)) {
      const inviteCode = extractInviteCode(inviteUrl)
      if (inviteCode) {
        groups.push({
          name: `Grupo ${groups.length + 1}`,
          inviteUrl,
          inviteCode,
          category: keyword,
          sourceUrl: url,
        })
      }
    }

    return groups
  } catch (error) {
    console.error('Erro ao buscar em grupos-online.com:', error)
    return []
  }
}

// Scraper para whatsgrupos.com
async function searchWhatsGrupos(keyword: string, limit: number): Promise<ScrapedGroup[]> {
  const url = `https://whatsgrupos.com/buscar?q=${encodeURIComponent(keyword)}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const groups: ScrapedGroup[] = []
    const links = extractWhatsAppLinks(html)

    for (const inviteUrl of links.slice(0, limit)) {
      const inviteCode = extractInviteCode(inviteUrl)
      if (inviteCode) {
        groups.push({
          name: `Grupo ${groups.length + 1}`,
          inviteUrl,
          inviteCode,
          category: keyword,
          sourceUrl: url,
        })
      }
    }

    return groups
  } catch (error) {
    console.error('Erro ao buscar em whatsgrupos.com:', error)
    return []
  }
}

export const SUPPORTED_SITES = [
  { id: 'gruposwhats', name: 'GruposWhats.app', url: 'https://gruposwhats.app' },
  { id: 'grupos-online', name: 'Grupos-Online.com', url: 'https://grupos-online.com' },
  { id: 'whatsgrupos', name: 'WhatsGrupos.com', url: 'https://whatsgrupos.com' },
] as const
