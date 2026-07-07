# Serviço Fácil

Plataforma para conectar prestadores de serviço e clientes.

---

## Fase Atual: 🔷 **Parte 2 — Site Web** (correções concluídas)

---

## 📋 Checklist Geral

### Parte 1 — Backend/API (server/)
- [x] Setup servidor Express + TypeScript
- [x] Configurar TypeScript (tsconfig.json)
- [ ] Configurar ESLint + Prettier
- [x] Configurar Prisma ORM + PostgreSQL
- [x] Modelos: User, Service, Review, Contract
- [x] Autenticação (JWT + bcrypt + refresh token)
- [x] Validação de entrada (Zod)
- [ ] Upload de imagens (Cloudinary) — *salvo em disco via `/uploads`*
- [x] Endpoints CRUD de usuários
- [x] Endpoints CRUD de serviços
- [x] Endpoints de comentários/avaliação
- [x] Endpoints de contratação
- [x] Segurança: Helmet, CORS, rate limit
- [x] Tratamento de erros global
- [ ] Logs de auditoria

### Parte 2 — Site Web (web/)
- [x] Setup Next.js + TypeScript
- [x] Autenticação (NextAuth v5 beta) — Google + Credentials
- [x] Landing page (hero + busca + categorias)
- [x] Página de cadastro (com Google + email)
- [x] Página de login (com Google + email)
- [x] Perfil do prestador com lista de serviços
- [x] Página de serviço detalhado + solicitação
- [x] Sistema de comentários e avaliação
- [x] Dashboard do prestador
- [x] Dashboard do cliente
- [x] Solicitação de contratação
- [ ] Upload de fotos (frontend)
- [x] Dark/Light mode automático + toggle
- [x] Font Inter + Tailwind + Shadcn/ui + Lucide
- [x] Micro-animações (hover, transitions)
- [x] Proxy middleware protegendo `/dashboard`

### Parte 3 — App Android (app/)
- [ ] Setup Expo + React Native + TypeScript
- [ ] Navegação (React Navigation)
- [ ] Autenticação (login/cadastro)
- [ ] Tela de busca
- [ ] Perfil do prestador
- [ ] Comentários e avaliação
- [ ] Upload de fotos (câmera/galeria)
- [ ] Notificações push
- [ ] Segurança: SSL Pinning, biometria

### Parte 4 — Infraestrutura & Deploy
- [ ] HTTPS/SSL configurado
- [ ] Variáveis de ambiente (.env)
- [ ] Docker + docker-compose
- [ ] CI/CD (GitHub Actions)
- [ ] LGPD: termo de privacidade, exclusão de conta
- [ ] Testes de segurança (OWASP Top 10)
- [ ] Deploy (Vercel/Render/Play Store)

---

## 📝 Anotações do Projeto

### Stack escolhida
| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + TypeScript |
| Banco | PostgreSQL + Prisma ORM |
| Site | Next.js + TypeScript |
| App | Expo (React Native) + TypeScript |
| Auth | JWT + bcrypt + NextAuth v5 |
| Upload | Local (disk) |
| Validação | Zod |
| Deploy | a definir |

### Requisitos de segurança
- Senhas com bcrypt (12 rounds)
- JWT em httpOnly cookies
- Rate limiting (100 req/15min global, 10 req/15min auth)
- Validação de entrada (Zod)
- CORS restrito
- Helmet headers
- Upload com validação MIME + UUID
- Refresh token com httpOnly + path separado
- @@unique no Review (sem duplicatas)
- Proxy middleware protegendo rotas `/dashboard`

### Decisões de Design (Parte 2)
- Landing: hero + busca + categorias direto na primeira tela
- Componentes: Shadcn/ui + Tailwind (prontos + customizáveis)
- Animações: micro (hover, fade in, skeleton)
- Ícones: Lucide React (minimalistas)
- Modo noturno: automático (sistema) + toggle manual no header
- Font: Inter (padrão moderno de mercado)
- Cores: Azul (#2563eb), Preto (#0f172a), Branco (#f8fafc)
- Login: Modal com Google + email/senha
- Painéis separados: Prestador (serviços/solicitações) vs Cliente (contratações/feed)
- Fluxo de contratação: Solicitar serviço → Prestador aceita → Chat liberado

### Pendências para próximas versões
- Cliente publicar pedidos ("Preciso de...")
- Chat em tempo real
- Pagamentos online
- Notificações push
- Localização/mapa
- Rating real no perfil (hoje hardcoded 4.8)

### Correções concluídas (07/07)
- `updateStatus`: permissão corrigida (só dono)
- `logout()`: limpa refreshToken
- `express.static("uploads")`: imagens servidas
- Ordem validate() antes de upload.array()
- Zod validation: updateService, updateProfile
- @@unique([clienteId, servicoId]) no Review
- Prisma singleton (globalThis)
- getProfile público sem email/telefone
- Login/Cadastro funcionais (signIn + fetch register)
- Mock data removido — erros reais com retry
- Toaster (sonner) no layout
- Navbar: painel por role, perfil por id
- Footer com links funcionais
- next-auth.d.ts com UserRole type
- Imports não usados removidos

---

## Últimas alterações
- 07/07/2026 — Revisão geral: 24 correções aplicadas (13 críticas/altas, 11 médias/baixas). Build OK (server + web). Preparado para lançamento.
- 06/07/2026 — Parte 2 iniciada: Landing, Cadastro, Login, Dashboards, Dark/Light mode.
