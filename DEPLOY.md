# Guia de Deploy — Star OS

Sistema de Gestão de Contratos de Aluguel para Licitações.

Este guia cobre a configuração completa: Supabase (banco de dados), senha de acesso, ambiente local e deploy no Railway.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configurar o Supabase](#2-configurar-o-supabase)
3. [Configurar o projeto localmente](#3-configurar-o-projeto-localmente)
4. [Testar localmente](#4-testar-localmente)
5. [Publicar no GitHub](#5-publicar-no-github)
6. [Deploy no Railway](#6-deploy-no-railway)
7. [Variáveis de ambiente em produção](#7-variáveis-de-ambiente-em-produção)
8. [Verificação pós-deploy](#8-verificação-pós-deploy)
9. [Controle de acesso (senha)](#9-controle-de-acesso-senha)
10. [Solução de problemas](#10-solução-de-problemas)

---

## 1. Pré-requisitos

| Ferramenta | Download |
|---|---|
| **Node.js 20+** | https://nodejs.org |
| **Git** | https://git-scm.com |
| **Conta Supabase** (grátis) | https://supabase.com |
| **Conta GitHub** (grátis) | https://github.com |
| **Conta Railway** (grátis para começar) | https://railway.app |

---

## 2. Configurar o Supabase

### 2.1 Criar o projeto

1. Acesse https://supabase.com e faça login.
2. Clique em **New Project**.
3. Escolha um nome (ex: `star-os`).
4. Defina uma senha forte para o banco de dados (anote em local seguro).
5. Escolha a região mais próxima (ex: **South America — São Paulo**).
6. Clique em **Create new project** e aguarde ~2 minutos.

### 2.2 Executar o script SQL

**Projeto novo:** execute `supabase/schema.sql` completo.

**Projeto já existente:** execute também as migrações em ordem:
- `supabase/migrations/add_empresa_contratada.sql` — campo *Empresa Contratada*
- `supabase/migrations/add_nome_contrato_and_status_item.sql` — *Nome do Contrato* e *Status do Item*
- `supabase/migrations/add_contratos_and_contrato_id.sql` — tabela *contratos* e FK `contrato_id` nas OS

1. No painel do Supabase, vá em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase/schema.sql` deste repositório.
4. Copie **todo** o conteúdo e cole no editor SQL.
5. Clique em **Run** (ou Ctrl+Enter).
6. Deve aparecer **Success. No rows returned**.

### 2.3 Obter as credenciais da API

1. Vá em **Settings** → **API**.
2. Anote os valores:

| Campo | Variável de ambiente |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> **Importante:** Use apenas a chave `anon public`. **Nunca** exponha a chave `service_role` no frontend.

---

## 3. Configurar o projeto localmente

### 3.1 Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/star_os.git
cd star_os
```

### 3.2 Instalar dependências

```bash
npm install
```

### 3.3 Criar o arquivo `.env.local`

```powershell
# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Edite `.env.local` com **todas** as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OS_ACCESS_PASSWORD=MinhaSenh@Segura123
```

| Variável | Onde fica | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (navegador) | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (navegador) | Chave anon do Supabase |
| `OS_ACCESS_PASSWORD` | **Somente servidor** | Senha das abas Cadastrar e Ordens |

> O arquivo `.env.local` **não** deve ser commitado no Git.

---

## 4. Testar localmente

```bash
npm run dev
```

Abra http://localhost:3000 — a página inicial redireciona para o **Calendário** (acesso livre).

### Checklist de teste

- [ ] Calendário abre sem senha em `/calendario`
- [ ] Clicar em "Cadastrar OS" pede senha
- [ ] Senha correta libera Cadastrar e Ordens
- [ ] Cadastrar uma OS com itens funciona
- [ ] OS aparece na listagem em `/ordens`
- [ ] Calendário **não** mostra valor financeiro no modal
- [ ] Modal do calendário mostra itens e quantidades
- [ ] Botão "Sair da área restrita" funciona

---

## 5. Publicar no GitHub

```bash
git init
git add .
git commit -m "feat: sistema Star OS - gestão de contratos"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/star_os.git
git push -u origin main
```

---

## 6. Deploy no Railway

### 6.1 Criar conta e conectar GitHub

1. Acesse https://railway.app e faça login com GitHub.
2. Autorize o Railway a acessar seus repositórios.

### 6.2 Criar novo projeto

1. Clique em **New Project**.
2. Selecione **Deploy from GitHub repo**.
3. Escolha o repositório `star_os`.
4. O Railway detectará automaticamente que é um projeto **Next.js**.

### 6.3 Configurações de build

O Railway usa por padrão:

| Configuração | Valor |
|---|---|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Port** | `$PORT` (automático) |

### 6.4 Gerar domínio público (Public Networking)

1. No painel do serviço, vá em **Settings** → **Networking**.
2. Em **Public Networking**, clique em **Generate Domain**.
3. Quando pedir **Target port**, use o valor da variável **`PORT`** do Railway.

| Campo | Valor |
|---|---|
| **Target port** | Valor de `PORT` (geralmente **8080** ou **3000**) |

**Como descobrir a porta correta:**

1. Vá em **Variables** e veja se existe `PORT` (o Railway injeta automaticamente).
2. Ou abra **Deployments** → último deploy → **View Logs** e procure algo como:
   `Ready on http://0.0.0.0:8080` ou `- Local: http://localhost:3000`

**Regra prática:** se o Railway sugerir **8080**, use **8080**. Se o log mostrar **3000**, use **3000**. A porta do domínio **tem que ser igual** à porta em que o app está escutando.

> O projeto já está configurado com `next start -H 0.0.0.0 -p ${PORT:-3000}` — ou seja, usa a variável `PORT` do Railway automaticamente.

4. Clique em **Generate Domain** e anote a URL (ex: `star-os-production.up.railway.app`).

### 6.5 Ordem recomendada de configuração

Para evitar erros de build, siga esta ordem:

1. Conecte o repositório GitHub
2. **Adicione todas as variáveis de ambiente** (seção 7) **antes** do primeiro deploy
3. Aguarde o deploy concluir
4. Acesse a URL gerada e teste

---

## 7. Variáveis de ambiente em produção

### 7.1 Adicionar variáveis no Railway

1. No painel do Railway, clique no serviço `star_os`.
2. Vá na aba **Variables**.
3. Adicione **cada variável**:

| Nome | Valor | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase | Sim |
| `OS_ACCESS_PASSWORD` | Senha escolhida por você | Sim |

> Use os **mesmos valores** do `.env.local`, exceto se quiser uma senha diferente em produção.

### 7.2 Redeploy após alterar variáveis

O Railway redeploya automaticamente ao salvar variáveis. Se não redeployar:

1. Aba **Deployments** → três pontos → **Redeploy**.

### 7.3 Diferença entre variáveis públicas e privadas

| Prefixo | Visibilidade | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_` | Visível no navegador (build + runtime) | Supabase URL e anon key |
| Sem prefixo | **Somente servidor** | `OS_ACCESS_PASSWORD` |

A senha **nunca** vai para o bundle JavaScript do navegador. A verificação acontece na API `/api/auth/os` e no middleware do Next.js.

---

## 8. Verificação pós-deploy

1. Acesse a URL do Railway
2. Confirme que o calendário abre sem senha
3. Tente acessar `/cadastrar` — deve redirecionar para `/login`
4. Digite a senha configurada no Railway
5. Cadastre uma OS de teste e verifique no calendário

Se algo falhar:

1. Console do navegador (F12 → Console)
2. Railway → **Deployments** → **View Logs**
3. Confirme as 3 variáveis de ambiente sem espaços extras

---

## 9. Controle de acesso (senha)

### Como funciona

| Rota | Acesso |
|---|---|
| `/calendario` | **Livre** — para funcionários do inventário |
| `/cadastrar` | **Protegida** — exige senha |
| `/ordens` | **Protegida** — exige senha |
| `/login` | Tela de senha |

- A senha fica em `OS_ACCESS_PASSWORD` (servidor).
- Após login correto, um cookie seguro (`httpOnly`) é salvo por 7 dias.
- O botão **"Sair da área restrita"** no menu remove o cookie.

### Trocar a senha

1. Altere `OS_ACCESS_PASSWORD` no Railway (Variables)
2. Aguarde o redeploy
3. Todos precisarão fazer login novamente com a nova senha

---

## 10. Solução de problemas

### Erro: "Senha não configurada no servidor"

**Causa:** `OS_ACCESS_PASSWORD` ausente no `.env.local` ou Railway.

**Solução:** Adicione a variável e reinicie/redeploy.

### Cadastrar/Ordens redireciona para login mesmo com senha certa

**Causa:** Cookie bloqueado ou variável diferente entre tentativas.

**Solução:**
- Limpe cookies do site e tente novamente
- Confirme que `OS_ACCESS_PASSWORD` é idêntica no `.env.local`
- Em produção, use HTTPS (Railway já fornece)

### Erro: variáveis Supabase não configuradas

**Solução:** Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Erro RLS no Supabase

**Solução:** Execute novamente `supabase/schema.sql` no SQL Editor.

### Página em branco após deploy

**Solução:**
1. Verifique logs de build no Railway
2. Adicione **todas** as variáveis antes do deploy
3. Force redeploy

---

## Estrutura do projeto

```
star_os/
├── supabase/schema.sql
├── src/
│   ├── app/
│   │   ├── api/auth/os/       # Login/logout (senha)
│   │   ├── api/ordens/        # REST API
│   │   ├── cadastrar/         # Protegida por senha
│   │   ├── ordens/            # Protegida por senha
│   │   ├── calendario/        # Acesso livre
│   │   └── login/             # Tela de senha
│   ├── components/
│   ├── lib/auth/os-session.ts # Lógica de sessão
│   └── middleware.ts          # Proteção de rotas
├── .env.example
└── DEPLOY.md
```

---

## Próximos passos (opcional)

- **Domínio personalizado:** Railway → Settings → Networking → Custom Domain
- **Backup Supabase:** Settings → Database → Backups
- **Senhas por usuário:** Migrar para Supabase Auth no futuro

---

*Star OS — Calendário aberto para inventário, gestão financeira protegida por senha.*
