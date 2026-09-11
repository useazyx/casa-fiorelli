# Casa Fiorelli

Site da Casa Fiorelli, restaurante italiano de Taubaté. Começou como um site estático em HTML e
Bootstrap e eu refiz como aplicação completa: cardápio, carrinho, checkout, reserva de mesa e
conta de cliente, com API e banco de dados de verdade.

## Tecnologias

- **Backend:** Node.js, Fastify, Prisma, PostgreSQL, Zod, JWT, Vitest
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, GSAP, Lenis

## Como rodar

Precisa de Node.js 20+ e PostgreSQL em `localhost:5432`.

Crie o banco do app e o banco dos testes:

```bash
psql -U postgres -c "CREATE DATABASE casa_fiorelli;"
psql -U postgres -c "CREATE DATABASE casa_fiorelli_test;"
```

Backend (copie `.env.example` para `.env` antes e coloque seu usuário e senha do Postgres na
`DATABASE_URL`):

```bash
cd backend
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev        # http://localhost:3333
```

Frontend:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

O Vite repassa `/api` para o backend, então é só abrir http://localhost:5173.

O seed cria duas contas com a senha `casafiorelli`: `diana@casafiorelli.com.br` (cliente, já
com pedidos, endereços e cupons) e `admin@casafiorelli.com.br`.

## O que tem

- Cardápio com 10 pratos, 9 combos e 14 bebidas, busca, filtro vegetariano e a história de
  cada receita
- Carrinho salvo no servidor, com preço sempre relido do banco e frete grátis acima de R$ 120
- Checkout com endereço, forma de pagamento, cupom e observações. Do cartão só ficam os quatro
  últimos dígitos
- Reservas em horários de 30 minutos, até 40 lugares por horário, dias fechados bloqueados
- Cadastro, login e redefinição de senha por token
- Perfil com pedidos, reservas, endereços, formas de pagamento, cupons e notificações

## Testes

```bash
cd backend && npm test     # testes da API no banco casa_fiorelli_test
cd frontend && npm test    # componentes, página do cardápio e transição entre páginas
```

Os testes do backend entram no Postgres como `postgres/postgres` (ver `backend/vitest.config.ts`).

## Imagens

As fotos de pratos, bebidas, destaques da semana e o logo são do site original, convertidas
para WebP. Três fotos são do Wikimedia Commons, com licença Creative Commons, e os créditos
estão em `frontend/public/CREDITOS-IMAGENS.md`.
