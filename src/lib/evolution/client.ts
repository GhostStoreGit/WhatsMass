import {
  EvolutionConfig,
  EvolutionResponse,
  ConnectionState,
  QRCode,
  GroupInfo,
  GroupParticipant,
  InviteInfo,
  SendMessageOptions,
  SendMediaOptions,
  MessageResponse,
} from './types'

export class EvolutionClient {
  private baseUrl: string
  private apiKey: string
  private instanceName: string

  constructor(config: EvolutionConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.instanceName = config.instanceName
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object,
    queryParams?: Record<string, string>
  ): Promise<EvolutionResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`)

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // ==================== INSTANCE ====================

  async getConnectionState(): Promise<EvolutionResponse<ConnectionState>> {
    return this.request<ConnectionState>(
      'GET',
      `/instance/connectionState/${this.instanceName}`
    )
  }

  async createInstance(options?: { qrcode?: boolean; number?: string }): Promise<EvolutionResponse<unknown>> {
    return this.request('POST', '/instance/create', {
      instanceName: this.instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: options?.qrcode ?? true,
      number: options?.number,
    })
  }

  async connectInstance(): Promise<EvolutionResponse<QRCode>> {
    return this.request<QRCode>('GET', `/instance/connect/${this.instanceName}`)
  }

  async logoutInstance(): Promise<EvolutionResponse<unknown>> {
    return this.request('DELETE', `/instance/logout/${this.instanceName}`)
  }

  async deleteInstance(): Promise<EvolutionResponse<unknown>> {
    return this.request('DELETE', `/instance/delete/${this.instanceName}`)
  }

  async restartInstance(): Promise<EvolutionResponse<unknown>> {
    return this.request('POST', `/instance/restart/${this.instanceName}`)
  }

  // ==================== GROUPS ====================

  async fetchAllGroups(getParticipants = false): Promise<EvolutionResponse<GroupInfo[]>> {
    return this.request<GroupInfo[]>(
      'GET',
      `/group/fetchAllGroups/${this.instanceName}`,
      undefined,
      { getParticipants: String(getParticipants) }
    )
  }

  async getGroupInfo(groupJid: string): Promise<EvolutionResponse<GroupInfo>> {
    return this.request<GroupInfo>(
      'GET',
      `/group/findGroupInfos/${this.instanceName}`,
      undefined,
      { groupJid }
    )
  }

  async getInviteInfo(inviteCode: string): Promise<EvolutionResponse<InviteInfo>> {
    return this.request<InviteInfo>(
      'GET',
      `/group/inviteInfo/${this.instanceName}`,
      undefined,
      { inviteCode }
    )
  }

  async joinGroup(inviteCode: string): Promise<EvolutionResponse<{ groupId: string }>> {
    return this.request<{ groupId: string }>(
      'GET',
      `/group/acceptInviteCode/${this.instanceName}`,
      undefined,
      { inviteCode }
    )
  }

  async leaveGroup(groupJid: string): Promise<EvolutionResponse<unknown>> {
    return this.request(
      'DELETE',
      `/group/leaveGroup/${this.instanceName}`,
      undefined,
      { groupJid }
    )
  }

  async getGroupParticipants(groupJid: string): Promise<EvolutionResponse<{ participants: GroupParticipant[] }>> {
    return this.request<{ participants: GroupParticipant[] }>(
      'GET',
      `/group/participants/${this.instanceName}`,
      undefined,
      { groupJid }
    )
  }

  // ==================== MESSAGES ====================

  async sendText(
    number: string,
    text: string,
    options?: SendMessageOptions
  ): Promise<EvolutionResponse<MessageResponse>> {
    return this.request<MessageResponse>('POST', `/message/sendText/${this.instanceName}`, {
      number,
      text,
      delay: options?.delay ?? 1000,
      linkPreview: options?.linkPreview ?? true,
      mentionsEveryOne: options?.mentionsEveryOne,
    })
  }

  async sendMedia(
    number: string,
    options: SendMediaOptions
  ): Promise<EvolutionResponse<MessageResponse>> {
    const mimeTypes: Record<string, string> = {
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/mpeg',
      document: 'application/pdf',
    }

    return this.request<MessageResponse>('POST', `/message/sendMedia/${this.instanceName}`, {
      number,
      mediatype: options.mediatype,
      mimetype: mimeTypes[options.mediatype] || 'application/octet-stream',
      media: options.media,
      caption: options.caption,
      fileName: options.fileName,
    })
  }

  // ==================== UTILS ====================

  static extractInviteCode(url: string): string | null {
    const match = url.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/)
    return match ? match[1] : null
  }

  static extractPhoneFromJid(jid: string): string {
    return jid.replace(/@s\.whatsapp\.net|@g\.us/g, '')
  }

  static formatPhoneToJid(phone: string, isGroup = false): string {
    const cleanPhone = phone.replace(/\D/g, '')
    return isGroup ? `${cleanPhone}@g.us` : `${cleanPhone}@s.whatsapp.net`
  }
}

// Singleton para uso global
let evolutionClient: EvolutionClient | null = null

export function getEvolutionClient(): EvolutionClient {
  if (!evolutionClient) {
    const baseUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME

    if (!baseUrl || !apiKey || !instanceName) {
      throw new Error('Evolution API environment variables not configured')
    }

    evolutionClient = new EvolutionClient({
      baseUrl,
      apiKey,
      instanceName,
    })
  }

  return evolutionClient
}
