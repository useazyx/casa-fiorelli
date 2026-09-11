# Casa Fiorelli

Website for Casa Fiorelli, an Italian restaurant in Taubaté, Brazil. It started as a static
HTML and Bootstrap site (kept in `legacy/`) and I rebuilt it as a full app: menu, cart,
checkout, table reservations and customer accounts, with a real API and database behind it.

The site itself is in Portuguese. [Leia em português](README.pt-BR.md).

## Stack

- **Backend:** Node.js, Fastify, Prisma, PostgreSQL, Zod, JWT, Vitest
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, GSAP, Lenis

## Running it

You need Node.js 20+ and PostgreSQL running on `localhost:5432`.

Create the app database and the one the tests use:

```bash
psql -U postgres -c "CREATE DATABASE casa_fiorelli;"
psql -U postgres -c "CREATE DATABASE casa_fiorelli_test;"
```

Backend (copy `.env.example` to `.env` first and put your Postgres user and password in
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

Vite proxies `/api` to the backend, so just open http://localhost:5173.

The seed creates two accounts, both with the password `casafiorelli`:
`diana@casafiorelli.com.br` (customer, already has orders, addresses and coupons) and
`admin@casafiorelli.com.br`.

## What's in it

- Menu with 10 dishes, 9 combos and 14 drinks, search, vegetarian filter and a modal with
  the story behind each recipe
- Cart stored on the server. Prices are always read again from the database, and delivery
  is free above R$ 120
- Checkout with address, payment method, coupon and notes. Only the last four digits of a
  card are stored
- Reservations in 30 minute slots, up to 40 seats per slot, closed days blocked
- Sign up, login and password reset by token
- Profile with orders, reservations, addresses, payment methods, coupons and notifications
- Order items keep a copy of name, price and image, so editing the menu doesn't change old
  orders

The backend follows one rule: controllers handle HTTP and validation, services hold the
business logic and are the only layer that talks to Prisma.

## Tests

```bash
cd backend && npm test     # API tests against casa_fiorelli_test
cd frontend && npm test    # components, menu page and page transitions
```

The backend tests log in to Postgres as `postgres/postgres` (see `backend/vitest.config.ts`).

## Images

Dish, drink and weekly special photos and the logo come from the original site, converted
to WebP. Three photos are from Wikimedia Commons under Creative Commons licenses, credited in
`frontend/public/CREDITOS-IMAGENS.md`.
