# WhatsMass

Sistema de automação de WhatsApp para gerenciamento de grupos, contatos e campanhas de mensagens em massa.

## Funcionalidades

- **Conexão WhatsApp** - Via Evolution API com QR Code
- **Busca de Grupos** - Scraping de diretórios de grupos
- **Gerenciamento de Grupos** - Entrar, sincronizar, extrair contatos
- **Contatos** - Extração e gerenciamento de contatos
- **Campanhas** - Envio em massa com rate limiting anti-ban
- **Dashboard** - Estatísticas em tempo real

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite (dev) / Turso (prod)
- **ORM**: Prisma 7
- **UI**: Tailwind CSS + shadcn/ui
- **WhatsApp**: Evolution API v2

## Deploy na Vercel

### 1. Criar banco de dados no Turso

```bash
# Instalar CLI do Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Criar banco
turso db create whatsmass

# Obter URL
turso db show whatsmass --url

# Criar token
turso db tokens create whatsmass
```

### 2. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/WhatsMass)

### 3. Configurar variáveis de ambiente na Vercel

```env
# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=whatsmass

# Turso Database
TURSO_DATABASE_URL=libsql://whatsmass-seu-usuario.turso.io
TURSO_AUTH_TOKEN=seu-token
```

### 4. Executar migrations

Após o deploy, execute as migrations no Turso:

```bash
turso db shell whatsmass < prisma/migrations/init.sql
```

Ou use o Prisma para criar as tabelas:

```bash
npx prisma db push
```

## Desenvolvimento Local

### Requisitos

- Node.js 18+
- Evolution API rodando

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/WhatsMass.git
cd WhatsMass

# Instale as dependências
npm install

# Configure as variáveis
cp .env.example .env
# Edite o .env com suas configurações

# Gere o cliente Prisma
npm run db:generate

# Crie as tabelas
npm run db:push

# Inicie o servidor
npm run dev
```

Acesse: http://localhost:3001

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # API Routes
│   │   ├── evolution/ # WhatsApp API
│   │   ├── groups/    # CRUD grupos
│   │   ├── contacts/  # CRUD contatos
│   │   ├── campaigns/ # CRUD campanhas
│   │   └── scrape/    # Scraping
│   └── dashboard/     # Páginas do dashboard
├── components/
│   └── ui/            # Componentes shadcn
└── lib/
    ├── evolution/     # Cliente Evolution API
    └── prisma.ts      # Cliente Prisma
```

## Configuração da Evolution API

Este projeto requer uma instância da Evolution API v2 rodando.

1. Clone e configure a Evolution API: https://github.com/EvolutionAPI/evolution-api
2. Crie uma instância com o nome configurado em `EVOLUTION_INSTANCE_NAME`
3. Use a API Key gerada como `EVOLUTION_API_KEY`

## Rate Limiting

Para evitar banimento, o sistema implementa:

- Delay entre mensagens: 30-60 segundos
- Limite diário: 200 mensagens
- Limite por hora: 30 mensagens
- Janela de envio configurável

## Licença

MIT
