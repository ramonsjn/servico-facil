# 🚀 Checklist de Lançamento — Serviço Fácil

Antes de colocar em produção, verificar cada item abaixo.

---

## 🔴 Pré-requisitos (obrigatório)

### Banco de Dados
- [ ] Rodar `npx prisma migrate dev` para aplicar `@@unique([clienteId, servicoId])`
- [ ] Verificar conexão PostgreSQL em produção
- [ ] Fazer backup do banco antes do deploy

### Variáveis de Ambiente — server/.env
- [ ] `JWT_SECRET` — gerar string forte (ex: `openssl rand -base64 32`)
- [ ] `JWT_REFRESH_SECRET` — string diferente da anterior
- [ ] `DATABASE_URL` — apontar para banco de produção
- [ ] `CORS_ORIGIN` — domínio do frontend (ex: `https://servicofacil.com`)
- [ ] `NODE_ENV=production`
- [ ] `UPLOAD_MAX_SIZE` — limite de upload (ex: `5242880`)
- [ ] Remover `CLOUDINARY_*` se não for usar

### Variáveis de Ambiente — web/.env.local
- [ ] `AUTH_SECRET` — gerar com `npx auth secret`
- [ ] `AUTH_GOOGLE_ID` — configurar no Google Cloud Console
- [ ] `AUTH_GOOGLE_SECRET` — configurar no Google Cloud Console
- [ ] `NEXT_PUBLIC_API_URL` — URL da API em produção
- [ ] `AUTH_URL` — URL do frontend (NextAuth)

### Dependências
- [ ] Mover `shadcn` de `dependencies` → `devDependencies` no `web/package.json`
- [ ] Remover `@auth/prisma-adapter` se não for usar
- [ ] Rodar `npm audit fix` para vulnerabilidades
- [ ] Verificar se TypeScript 6.0.3 é estável ou reverter para 5.x

### Build & Deploy
- [ ] `cd server && npm run build` — sem erros
- [ ] `cd web && npm run build` — sem erros
- [ ] Configurar domínio + SSL (HTTPS)
- [ ] Configurar `express.static` para servir uploads no servidor de produção
- [ ] Configurar proxy reverso (Nginx/Caddy) para API + Next.js

---

## 🟡 Verificações de segurança

- [ ] Helmet ativo no servidor
- [ ] CORS com origem restrita (não `*`)
- [ ] Rate limiting ativo (100 req/15min global)
- [ ] httpOnly cookies (token + refreshToken)
- [ ] Refresh token com path restrito (`/api/auth/refresh`)
- [ ] Senhas com bcrypt (12 rounds)
- [ ] Zod validando entrada em todos os endpoints
- [ ] @@unique no Review — sem duplicatas
- [ ] Upload validado (MIME: JPEG, PNG, WebP) + UUID filename
- [ ] Proxy middleware protegendo `/dashboard`
- [ ] .env no `.gitignore`

---

## 🟢 Testes manuais (antes do deploy)

- [ ] `GET /api/health` → `{ status: "ok" }`
- [ ] `POST /api/auth/register` — criar conta
- [ ] `POST /api/auth/login` — logar com credenciais
- [ ] `POST /api/auth/login` — erro com senha errada (401)
- [ ] Google OAuth — fluxo completo
- [ ] `POST /api/auth/refresh` — renovar token
- [ ] `POST /api/auth/logout` — limpar cookies
- [ ] `GET /api/servicos` — listar com paginação
- [ ] `GET /api/servicos/:id` — detalhe com reviews
- [ ] `POST /api/servicos` — criar serviço (como PRESTADOR)
- [ ] `PUT /api/servicos/:id` — atualizar (só dono)
- [ ] `DELETE /api/servicos/:id` — deletar (só dono)
- [ ] `POST /api/contratos/servico/:servicoId` — solicitar (como CLIENTE)
- [ ] `PATCH /api/contratos/:id/status` — aceitar/cancelar (só prestador dono)
- [ ] `POST /api/avaliacoes/servico/:servicoId` — avaliar
- [ ] `POST /api/avaliacoes/servico/:servicoId` — rejeitar duplicata (409)
- [ ] Upload de imagem → acessível via `/uploads/{filename}`
- [ ] Frontend: login → redirect para home
- [ ] Frontend: cadastro → login automático
- [ ] Frontend: serviço detalhe → solicitar (com toast)
- [ ] Frontend: dashboard protegido (sem token → redirect /login)
- [ ] Frontend: dark/light mode

---

## 🔵 Pós-lançamento

- [ ] Monitorar erros com logger (Winston/Sentry)
- [ ] Adicionar `error.tsx` e `not-found.tsx` no frontend
- [ ] Implementar rotação de refresh token
- [ ] Dashboard cliente/prestador dinâmico (hoje estático)
- [ ] Adicionar índices no banco (`categoria`, `prestadorId`)
- [ ] Graceful shutdown (SIGINT/SIGTERM)
- [ ] Testes automatizados (integração + e2e)
- [ ] LGPD: termo de privacidade, exclusão de conta
