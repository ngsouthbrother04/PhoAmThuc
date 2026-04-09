# Backend DB Bootstrap Guide

This folder defines the canonical database baseline for Backend Core (DB-01).

## Canonical Tables

- points_of_interest
- tours
- analytics_events

## Stable Conventions

- `PoiType` uses stable keys: `FOOD`, `DRINK`, `SNACK`, `WC`.
- UI localization for type labels must be handled in API/web mapping, not by changing DB enum values.
- Tour duration is represented by Prisma field `duration`, mapped to DB column `estimated_time`.
- Content publication uses integer `content_version` on both `points_of_interest` and `tours`.

## Local Setup (one-time)

From repository root:

```bash
docker compose up -d postgres
cd apps/backend
npm run db:setup
```

## Useful Commands

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:doctor
npm run prisma:studio
npm run prisma:migrate:deploy
npm run prisma:seed
```

## Prisma Studio Troubleshooting

- Use Node LTS (`20` or `22`). This backend pins Node via `.nvmrc` and `engines.node`.
- Reinstall dependencies after switching Node version:

```bash
cd apps/backend
npm ci
npm run prisma:doctor
```

- If Studio UI shows `Unable to communicate with Prisma Client`, verify DB access and restart Studio:

```bash
npx prisma studio --schema prisma/schema.prisma --browser none --port 5555
```

- On Windows, ensure your `DATABASE_URL` host/port is reachable from your machine and not blocked by firewall/antivirus.

## Notes for Team

- If local DB already has old schema, use a clean local reset before onboarding:

```bash
cd ../..
docker compose down -v
docker compose up -d postgres
cd apps/backend
npm run db:setup
```

- Do not edit historical migration files after shared usage starts.
- Add new schema changes only with a new migration directory.
